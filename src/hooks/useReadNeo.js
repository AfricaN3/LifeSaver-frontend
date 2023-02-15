import { useState, useEffect, useCallback, useMemo } from "react";

import { useWallet } from "@rentfuse-labs/neo-wallet-adapter-react";
import Neon from "@cityofzion/neon-js";
import { rpc } from "@cityofzion/neon-core";

import {
  nodeUrl,
  lifeMainnetContractAddress,
  gasContractAddress,
  mainnetMagic,
} from "../utils/constants";
import { toInvocationArgument, convertPermissions } from "../utils/converter";
import { convertEra } from "../utils/convertEra";
import { isGasSupportedParams } from "../utils/parameters";

const useReadNeo = () => {
  const { address, connected } = useWallet();
  const [eraFee, setEraFee] = useState(0);
  const [eras, setEras] = useState([]);
  const [erasNumber, setErasNumber] = useState(0);
  const [userPermissions, setUserPermissions] = useState({});
  const [isGasSupported, setIsGasSupported] = useState(false);
  const [gasBalance, setGasBalance] = useState(0);
  const [lifeBalance, setLifeBalance] = useState([]);

  const rpcClient = useMemo(() => new rpc.RPCClient(nodeUrl), []);

  const getErasTransaction = useCallback(() => {
    const getEras = async () => {
      if (erasNumber > 0) {
        const contract = new Neon.experimental.SmartContract(
          Neon.u.HexString.fromHex(lifeMainnetContractAddress),
          {
            networkMagic: mainnetMagic,
            rpcAddress: nodeUrl,
          }
        );
        let erasData = [];
        for (var i = 0; i < erasNumber; ++i) {
          let num = i + 1;
          let str = num.toString();
          let eraJsonResult = await contract.testInvoke("getEra", [
            toInvocationArgument("Integer", str),
          ]);
          let convertedEra = convertEra(eraJsonResult.stack[0].value);
          erasData.push(convertedEra);
        }
        setEras(erasData);
      }
    };
    getEras();
  }, [erasNumber]);

  useEffect(() => {
    const contract = new Neon.experimental.SmartContract(
      Neon.u.HexString.fromHex(lifeMainnetContractAddress),
      {
        networkMagic: mainnetMagic,
        rpcAddress: nodeUrl,
      }
    );
    const sendTransaction = async () => {
      const result = await contract.testInvoke("getEraFee");
      const totalEraResult = await contract.testInvoke("totalEra");
      const gasResult = await contract.testInvoke(
        isGasSupportedParams.operation,
        isGasSupportedParams.args.map((_arg) =>
          toInvocationArgument(_arg.type, _arg.value)
        )
      );
      setEraFee(result.stack[0].value);
      setIsGasSupported(gasResult.stack[0].value);
      setErasNumber(parseInt(totalEraResult.stack[0].value));
    };
    sendTransaction();
    getErasTransaction();
  }, [getErasTransaction]);

  useEffect(() => {
    if (connected) {
      const gasContract = new Neon.experimental.SmartContract(
        Neon.u.HexString.fromHex(gasContractAddress),
        {
          networkMagic: mainnetMagic,
          rpcAddress: nodeUrl,
        }
      );
      const lifeContract = new Neon.experimental.SmartContract(
        Neon.u.HexString.fromHex(lifeMainnetContractAddress),
        {
          networkMagic: mainnetMagic,
          rpcAddress: nodeUrl,
        }
      );
      const sendConnectedTransaction = async () => {
        const gasBalanceResult = await gasContract.testInvoke("balanceOf", [
          toInvocationArgument("Hash160", address),
        ]);
        const lifeBalanceResult = await lifeContract.testInvoke("balanceOf", [
          toInvocationArgument("Hash160", address),
        ]);
        const lifeTokensOfResult = await lifeContract.testInvoke("tokensOf", [
          toInvocationArgument("Hash160", address),
        ]);
        const userPermissionsResult = await lifeContract.testInvoke(
          "getUserJson",
          [toInvocationArgument("Hash160", address)]
        );
        setGasBalance(gasBalanceResult.stack[0].value);
        let data = userPermissionsResult.stack[0].value[2].value.value;
        const dictionary = data.reduce((dictionary, permission) => {
          dictionary[convertPermissions(permission.key.value)] =
            permission.value.value;
          return dictionary;
        }, {});
        setUserPermissions(dictionary);
        let count = lifeBalanceResult.stack[0].value;
        let nftiterator = await rpcClient.traverseIterator(
          lifeTokensOfResult.session,
          lifeTokensOfResult.stack[0].id,
          parseInt(count)
        );

        const lifeList = nftiterator.reduce((list, nft) => {
          list.push(convertPermissions(nft.value[1].value));
          return list;
        }, []);
        let nftArray = [];
        for (let i = 0; i < lifeList.length; i++) {
          const lifeResult = await lifeContract.testInvoke("getLifeJson", [
            toInvocationArgument("String", lifeList[i]),
          ]);
          nftArray.push(lifeResult.stack[0].value);
        }
        const nftDetailsList = nftArray.reduce((list, nft) => {
          const dictionary = nft.reduce((dictionary, attribute) => {
            dictionary[convertPermissions(attribute.key.value)] =
              attribute.value.value;
            return dictionary;
          }, {});
          list.push(dictionary);
          return list;
        }, []);
        setLifeBalance(nftDetailsList);
      };
      sendConnectedTransaction();
    } else {
      setGasBalance(0);
      setUserPermissions({});
    }
  }, [connected, address, rpcClient]);

  return {
    eraFee,
    isGasSupported,
    eras,
    erasNumber,
    gasBalance,
    userPermissions,
    getErasTransaction,
    lifeBalance,
  };
};

export default useReadNeo;
