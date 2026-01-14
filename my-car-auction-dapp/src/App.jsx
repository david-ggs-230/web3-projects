import { useEffect, useState } from "react";
import {
  web3,
  wscontract,
  carcontract,
  accounts,
  updateContract,
} from "./web3/auction.js";
import ComboList from "./ComboList.jsx";
import "./App.css";

const App = () => {
  const [accountId, setAccountId] = useState(-1);
  const [contract, setContract] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pollingRef, setPollingRef] = useState(null);
  const [bidValue, setBidValue] = useState(0);
  const [prevBidValue, setPrevBidValue] = useState(0);

  const [bidder, setBidder] = useState({
    accountId: "",
    address: "",
    balance: "",
    bidValue: "",
  });

  const [bidValidation, setBidValidation] = useState("");
  const [biddingStatus, setBiddingStatus] = useState("");
  const [auctionData, setAuctionData] = useState({
    carBrand: "",
    registrationNumber: "",
    owner: "",
    auctionStart: "",
    auctionEnd: "",
    highestBid: "",
    highestBidder: "",
  });
  const [eventsLog, setEventsLog] = useState([]);
  const [isAuctionOwner, setIsAuctionOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState("UNKNOWN");
  const isNumericString = (value) => {
    if (typeof value !== "string") return false;
    return /^\d+[.]?(\d+)?$/.test(value.trim());
  };

  const handleBidderChange = (bid) => {
    if (bid < 0 || bid >= accounts.length) return;
    setContract(updateContract(accounts[bid]));
    setAccountId(bid);
  };

  const handleBidValueChange = (e) => {
    console.log("Bid value changed:", e.target.value);
    const value = e.target.value;
    setBidValue(value);
    if (isNumericString(value)) {
      setBidValidation("");
    } else {
      setBidValidation("Please enter a valid number");
    }
  };

  /*   const handleBid = async () => {
      if (!contract) {
    setBidValidation("Contract not initialized");
    return;
  }

  if (!bidder.address) {
    setBidValidation("Please select an account first");
    return;
  }
    const value = parseFloat(bidValue);
  // 验证输入
  if (isNaN(value) || value <= 0) {
    setBidValidation("Please enter a valid positive number");
    return;
  }


    const mybid = web3.utils.toWei(bidValue, "ether");
    const prevbid = web3.utils.toWei(prevBidValue, "wei");
    const bidamount = mybid - prevbid;
    if (isNumericString(value)) {
      setBidValidation("Please enter a valid bid amount");
      return;
    } else if (bidamount <= 0) {
      setBidValidation("Please enter a larger bid amount");
      return;
    } else if (bidder.balance < bidamount) {
      setBidValidation("Insufficient balance for this bid");
      return;
    } else if (auctionData.highestBid >= mybid) {
      setBidValidation("Your bid must be higher than the current highest bid");
      return;
    }
    setBidValidation("");
    setBiddingStatus("Processing bid...");
    setIsLoading(true);
    try {
      const success = await contract.methods
        .bid()
        .send({ from: bidder.address, value: bidamount });

      if (success) {
        const highestBid = await contract.methods.highestBid().call();
        const highestBidder = await carcontract.methods.highestBidder().call();
        const state = await carcontract.methods.getAuctionStatus().call();
        const myBid = await contract.methods.bids(bidder.address).call();
        setPrevBidValue(myBid);
        setAuctionData((prev) => ({
          ...prev,
          highestBid: highestBid,
          highestBidder: highestBidder,
          state: state,
        }));

        setBiddingStatus("Bid submitted successfully!");
        setEventsLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] New bid: ${value} ETH`,
        ]);
      } else {
        setBiddingStatus("Bid failed!");
        setEventsLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Bid of ${value} ETH failed`,
        ]);
      }
    } catch (error) {
      setBiddingStatus("Bid failed!");
      setEventsLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Bid failed: ${error.message}`,
      ]);
    } finally {
      setIsLoading(false);
    }
  }; */
  const handleBid = async () => {
    if (!contract) {
      setBidValidation("Contract not initialized");
      return;
    }

    if (!bidder.address) {
      setBidValidation("Please select an account first");
      return;
    }

    const value = parseFloat(bidValue);

    // 验证输入
    if (isNaN(value) || value <= 0) {
      setBidValidation("Please enter a valid positive number");
      return;
    }

    try {
      const mybid = web3.utils.toWei(bidValue, "ether");
      const mybidWei = BigInt(mybid);
      const prevBidWei = BigInt(prevBidValue || 0);
      const bidamount = (mybidWei - prevBidWei).toString();
      const state = await carcontract.methods.getAuctionStatus().call();
      if (auctionStatus !== state) {
        setAuctionStatus(state);
      }
      if (state.toLowerCase() !== "ACTIVE".toLowerCase()) {
        setBidValidation("Auction is not active");
        return;
      }
      if (bidamount <= 0) {
        setBidValidation("Please enter a larger bid amount");
        return;
      }

      // 获取当前余额和最高出价
      const [balance, currentHighestBid] = await Promise.all([
        web3.eth.getBalance(bidder.address),
        carcontract.methods.highestBid().call(),
      ]);

      if (BigInt(balance) < BigInt(bidamount)) {
        setBidValidation("Insufficient balance for this bid");
        return;
      }

      if (BigInt(currentHighestBid) >= mybidWei) {
        setBidValidation(
          "Your bid must be higher than the current highest bid",
        );
        return;
      }

      setBidValidation("");
      setBiddingStatus("Processing bid...");
      setIsLoading(true);

      // 发送交易
      const receipt = await contract.methods.bid().send({
        from: bidder.address,
        value: bidamount,
        gas: 300000, // 明确指定 gas limit
      });

      if (receipt.status) {
        // 更新数据
        const [highestBid, highestBidder, myBid] = await Promise.all([
          carcontract.methods.highestBid().call(),
          carcontract.methods.highestBidder().call(),
          carcontract.methods.getAuctionStatus().call(),
          contract.methods.bids(bidder.address).call(),
        ]);

        setPrevBidValue(myBid);
        setAuctionData((prev) => ({
          ...prev,
          highestBid: highestBid,
          highestBidder: highestBidder,
        }));

        setBiddingStatus("Bid submitted successfully!");
        setEventsLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] New bid: ${value} ETH (tx: ${receipt.transactionHash.slice(0, 10)}...)`,
        ]);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Bid error:", error);
      let errorMessage = "Bid failed!";

      if (error.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction";
      } else if (error.message.includes("revert")) {
        errorMessage = "Transaction reverted. Check auction state.";
      }

      setBiddingStatus(errorMessage);
      setEventsLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Bid failed: ${error.message}`,
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  // 初始化
  useEffect(() => {
    const loadCarContract = async () => {
      setEventsLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Loading car contract...`,
      ]);

      console.log("Loading car contract...");
      setContract(carcontract);

      try {
        const [
          car,
          auction_start,
          auction_end,
          highestBid,
          highestBidder,
          stateStatus,
        ] = await Promise.all([
          carcontract.methods.Mycar().call(),
          carcontract.methods.auction_start().call(),
          carcontract.methods.auction_end().call(),
          carcontract.methods.highestBid().call(),
          carcontract.methods.highestBidder().call(),
          carcontract.methods.getAuctionStatus().call(),
        ]);
        setAuctionData((prev) => ({
          ...prev,
          carBrand: car.Brand || car[0] || "",
          registrationNumber: car.Rnumber || car[1] || "",
          owner: car.owner || car[2] || "",
          auctionStart: auction_start,
          auctionEnd: auction_end,
          highestBid: highestBid,
          highestBidder: highestBid > 0 ? highestBidder : "",
        }));
        setAuctionStatus(stateStatus);
        setEventsLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Car contract loaded successfully.`,
        ]);
        console.log("Car contract loaded.");

        // 设置事件监听
        setupEventListeners();
      } catch (error) {
        console.error("Failed to load contract data:", error);
        setEventsLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Error loading contract: ${error.message}`,
        ]);
      }
    };

    const setupEventListeners = () => {
      if (!wscontract) {
        console.warn("WebSocket contract not available, using polling");
        setupEventPolling();
        return;
      }

      try {
        // BidEvent 监听
        const bidSubscription = wscontract.events.BidEvent();
        bidSubscription.on("data", (event) => {
          try {
            const { highestBid, highestBidder } = event.returnValues;
            setEventsLog((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] onBidEvent: Bidder ${highestBidder} bid ${web3.utils.fromWei(
                highestBid,
                "ether",
              )} ETH`,
            ]);
          } catch (error) {
            console.error("Error processing BidEvent:", error);
          }
        });
        bidSubscription.on("error", (error) => {
          console.error("BidEvent subscription error:", error);
          // 尝试退回到轮询
          bidSubscription.unsubscribe();
          setupEventPolling();
        });

        // CanceledEvent 监听
        const cancelSubscription = wscontract.events.CanceledEvent();
        cancelSubscription.on("data", (event) => {
          try {
            const { message, time } = event.returnValues;
            setEventsLog((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] onCanceledEvent: ${message} at ${new Date(Number(time) * 1000).toLocaleString()}`,
            ]);
          } catch (error) {
            console.error("Error processing CanceledEvent:", error);
          }
        });
        cancelSubscription.on("error", (error) => {
          console.error("CanceledEvent subscription error:", error);
          cancelSubscription.unsubscribe();
        });

        // WithdrawalEvent 监听
        const withdrawalSubscription = wscontract.events.WithdrawalEvent();
        withdrawalSubscription.on("data", (event) => {
          try {
            const { withdrawer, amount } = event.returnValues;
            setEventsLog((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] onWithdrawalEvent: withdrawer ${withdrawer} ${web3.utils.fromWei(
                amount,
                "ether",
              )} ETH`,
            ]);
          } catch (error) {
            console.error("Error processing WithdrawalEvent:", error);
          }
        });
        withdrawalSubscription.on("error", (error) => {
          console.error("WithdrawalEvent subscription error:", error);
          withdrawalSubscription.unsubscribe();
        });

        // AuctionFinalized 监听
        const finalizedSubscription = wscontract.events.AuctionFinalized();
        finalizedSubscription.on("data", (event) => {
          try {
            const { winner, amount, carBrand } = event.returnValues;
            setEventsLog((prev) => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] onAuctionFinalized: winner: ${winner}, bid ${web3.utils.fromWei(
                amount,
                "ether",
              )} ETH, car brand: ${carBrand}`,
            ]);
          } catch (error) {
            console.error("Error processing AuctionFinalized:", error);
          }
        });
        finalizedSubscription.on("error", (error) => {
          console.error("AuctionFinalized subscription error:", error);
          finalizedSubscription.unsubscribe();
        });

        // 存储订阅引用以便清理
        setSubscriptions([
          bidSubscription,
          cancelSubscription,
          withdrawalSubscription,
          finalizedSubscription,
        ]);
      } catch (error) {
        console.error("Failed to setup event listeners:", error);
        setupEventPolling();
      }
    };

    const setupEventPolling = () => {
      console.log("Setting up event polling");
      let pollingInterval;
      let latestBlock = 0;

      const pollEvents = async () => {
        try {
          const currentBlock = await web3.eth.getBlockNumber();

          if (currentBlock > latestBlock) {
            // 获取过去的事件
            const events = await carcontract.getPastEvents("allEvents", {
              fromBlock: latestBlock || 0,
              toBlock: currentBlock,
            });

            events.forEach((event) => {
              handleEvent(event);
            });

            latestBlock = currentBlock;
          }
        } catch (error) {
          console.error("Event polling error:", error);
        }
      };

      // 立即执行一次
      pollEvents();
      // 每 10 秒轮询一次
      pollingInterval = setInterval(pollEvents, 10000);

      // 存储轮询引用
      setPollingRef(pollingInterval);
    };

    const handleEvent = (event) => {
      try {
        switch (event.event) {
          case "BidEvent":
            {
              const { highestBid, highestBidder } = event.returnValues;
              setEventsLog((prev) => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] [Polling] BidEvent: Bidder ${highestBidder} bid ${web3.utils.fromWei(
                  highestBid,
                  "ether",
                )} ETH`,
              ]);
            }
            break;

          case "CanceledEvent":
            {
              const { message, time } = event.returnValues;
              setEventsLog((prev) => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] [Polling] CanceledEvent: ${message} at ${new Date(Number(time) * 1000).toLocaleString()}`,
              ]);
            }
            break;

          case "WithdrawalEvent":
            {
              const { withdrawer, amount } = event.returnValues;
              setEventsLog((prev) => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] [Polling] WithdrawalEvent: withdrawer ${withdrawer} ${web3.utils.fromWei(
                  amount,
                  "ether",
                )} ETH`,
              ]);
            }
            break;

          case "AuctionFinalized":
            {
              const {
                winner,
                amount: finalAmount,
                carBrand,
              } = event.returnValues;
              setEventsLog((prev) => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] [Polling] AuctionFinalized: winner: ${winner}, bid ${web3.utils.fromWei(
                  finalAmount,
                  "ether",
                )} ETH, car brand: ${carBrand}`,
              ]);
            }
            break;
        }
      } catch (error) {
        console.error("Error handling event:", error);
      }
    };

    loadCarContract();

    // 清理函数
    return () => {
      // 清理订阅
      if (subscriptions) {
        subscriptions.forEach((sub) => {
          try {
            sub.unsubscribe();
          } catch (e) {
            console.error("Error unsubscribing:", e);
          }
        });
      }

      // 清理轮询
      if (pollingRef) {
        clearInterval(pollingRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 使用一个单独的 effect 来触发accountId变化时的数据加载
  useEffect(() => {
    const loadBidder = async (web3) => {
      setEventsLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Loading bidder...`,
      ]);
      console.log("Loading bidder...");
      if (accountId < 0) return;
      if (accountId >= accounts.length) return;
      const address = accounts[accountId];
      const owner = await contract.methods.get_owner().call();
      if (address.toLowerCase() === owner.toLowerCase()) {
        setIsAuctionOwner(true);
      } else {
        setIsAuctionOwner(false);
      }
      const balance = await web3.eth.getBalance(address);
      const myBid = await contract.methods.bids(address).call();
      setBidder({
        accountId: accountId,
        address: address,
        balance: balance,
      });
      setPrevBidValue(myBid);

      setEventsLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Bidder loaded.`,
      ]);
      console.log("Bidder loaded.");
    };

    loadBidder(web3);
  }, [accountId, contract]);

  const weiToEth = (wei) => {
    return wei > 0 ? web3.utils.fromWei(wei, "ether") + " ETH" : "0 ETH";
  };
  /*   const cancelAuction = () => {
    if (!isAuctionOwner) {
      alert("Only the auction owner can cancel the auction.");
      return;
    }
    if (window.confirm("Are you sure you want to cancel the auction?")) {
      //const success = await contract.methods.cancel_auction().send();
      contract.methods
        .cancel_auction()
        .send()
        .then((success) => {
          if (success) {
            setAuctionData((prev) => ({
              ...prev,
              state: "Cancelled",
            }));
            setEventsLog((prev) => [
              ...prev,
              `$[${new Date().toLocaleTimeString()}] Auction cancelled by owner`,
            ]);
          } else {
            setEventsLog((prev) => [
              ...prev,
              `$[${new Date().toLocaleTimeString()}] Auction cancel operation error`,
            ]);
          }
          //console.log("Cancel auction result:", success);
        })
        .catch((e) => {
          console.log("Cancel auction error");
          console.log(e);
        });
    }
  }; */
  const cancelAuction = async () => {
    if (!isAuctionOwner) {
      alert("Only the auction owner can cancel the auction.");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel the auction?")) {
      return;
    }

    setIsLoading(true);
    try {
      const state = await carcontract.methods.getAuctionStatus().call();
      if (auctionStatus !== state) {
        setAuctionStatus(state);
      }
      if (state.toLowerCase() !== "ACTIVE".toLowerCase()) {
        alert("Auction is not active");
        return;
      }

      const receipt = await contract.methods
        .cancel_auction()
        .send({ from: bidder.address, gas: 300000 });

      const state2 = await carcontract.methods.getAuctionStatus().call();
      if (auctionStatus !== state2) {
        setAuctionStatus(state2);
      }
      if (receipt.status) {
        setEventsLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Auction cancelled successfully`,
        ]);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Cancel auction error:", error);
      setEventsLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Cancel auction failed: ${error.message}`,
      ]);
      alert(`Failed to cancel auction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  /*   const finalizeAuction = () => {
    if (!isAuctionOwner) {
      alert("Only the auction owner can finalize the auction.");
      return;
    }
    if (
      window.confirm(
        "Are you sure you want to finalize the auction? This action cannot be undone.",
      )
    ) {
      contract.methods
        .finalizeAuction()
        .send()
        .then((success) => {
          if (success) {
            setAuctionData((prev) => ({
              ...prev,
              state: "Finalized",
            }));
            setEventsLog((prev) => [
              ...prev,
              `$[${new Date().toLocaleTimeString()}] Auction Finalized by owner`,
            ]);
          } else {
            setEventsLog((prev) => [
              ...prev,
              `$[${new Date().toLocaleTimeString()}] Auction Finalize operation error`,
            ]);
          }
          //console.log("Finalize auction result:", success);
        })
        .catch((e) => {
          console.log("Finalize auction error");
          console.log(e);
        });

      setAuctionData((prev) => ({
        ...prev,
        state: "Finalized",
      }));
      setEventsLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Auction Finalized`,
      ]);
    }
  }; */
  const finalizeAuction = async () => {
    if (!isAuctionOwner) {
      alert("Only the auction owner can finalize the auction.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to finalize the auction? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const state = await carcontract.methods.getAuctionStatus().call();
      if (auctionStatus !== state) {
        setAuctionStatus(state);
      }
      if (state.toLowerCase() !== "ACTIVE".toLowerCase()) {
        alert("Auction is not active");
        return;
      }
      const receipt = await contract.methods
        .finalizeAuction()
        .send({ from: bidder.address, gas: 300000 });

      const state2 = await carcontract.methods.getAuctionStatus().call();
      if (auctionStatus !== state2) {
        setAuctionStatus(state2);
      }
      if (receipt.status) {
        setEventsLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Auction finalized successfully`,
        ]);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Finalize auction error:", error);
      setEventsLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Finalize auction failed: ${error.message}`,
      ]);
      alert(`Failed to finalize auction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="app-container">
      <div className="row">
        <div className="col-lg-12">
          <div className="page-header">
            <h3>Car Auction Dapp</h3>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <h3>Car Auction Details</h3>
          <div className="well card mt-10">
            <div>
              <label className="lead">Brand: </label>
              <span id="car_brand" className="car-detail">
                {auctionData.carBrand}
              </span>
              <br />
              <label className="lead">Registration Number: </label>
              <span id="registration_number" className="car-detail">
                {auctionData.registrationNumber}
              </span>
              <br />
              <label className="lead">Owner: </label>
              <span className="car-detail">{auctionData.owner}</span>
              <br />
              <label className="lead">Auction Start: </label>
              <span className="car-detail">
                {new Date(
                  Number(auctionData.auctionStart) * 1000,
                ).toLocaleString()}
              </span>
              <br />
              <label className="lead">Auction End: </label>
              <span className="car-detail">
                {new Date(
                  Number(auctionData.auctionEnd) * 1000,
                ).toLocaleString()}
              </span>
              <br />
              <label className="lead">Auction Highest Bid: </label>
              <span id="HighestBid" className="auction-detail">
                {weiToEth(auctionData.highestBid)}
              </span>
              <br />
              <label className="lead">Auction Highest Bidder: </label>
              <span id="HighestBidder" className="auction-detail">
                {auctionData.highestBidder}
              </span>
              <br />
              <label className="lead">Auction Status: </label>
              <span id="STATE" className="auction-detail">
                {auctionStatus}
              </span>
            </div>
            <div className="events-section">
              <legend className="lead">Events Logs</legend>
              <div id="eventslog" className="events-log">
                {/*eventsLog*/}
                {eventsLog.map((item, index) => (
                  <p key={`${"" + index}`}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <h3>Bidder Details</h3>
          <div className="well card mt-10">
            <ComboList
              items={accounts}
              placeholder="Choose an account..."
              handleItemChange={handleBidderChange}
            />
            <div className="mt-20">
              <label className="lead">AccountID: </label>
              <span className="car-detail">{bidder.accountId}</span>
              <br />
              <label className="lead">Address: </label>
              <span className="car-detail">{bidder.address}</span>
              <br />
              <label className="lead">Balance: </label>
              <span className="car-detail">
                {web3 && web3.utils
                  ? Math.round(
                      web3.utils.fromWei(bidder.balance, "ether") * 1000000,
                    ) /
                      1000000 +
                    " ETH"
                  : ""}
              </span>
              <br />
              <label className="lead">My Previous Bid: </label>
              <span
                id="MyBid"
                className="auction-detail"
                style={{ color: "red" }}
              >
                {weiToEth(prevBidValue)}
              </span>
            </div>

            <div className="bid-section">
              <legend className="lead">Bid value</legend>
              <small>eg. 100</small>
              <div className="form-group">
                <input
                  className="form-control"
                  type="text"
                  id="value"
                  value={bidValue}
                  onChange={handleBidValueChange}
                  disabled={isLoading}
                />
                {bidValidation && (
                  <span id="valueValidation" className="validation-error">
                    {bidValidation}
                  </span>
                )}
              </div>

              <div className="bid-action">
                <button
                  className="btn btn-default"
                  onClick={handleBid}
                  disabled={isLoading || !!bidValidation}
                >
                  {isLoading ? "Processing..." : "Bid!"}
                </button>
                <br />
                {biddingStatus && (
                  <span id="biding_status" className="bidding-status">
                    {biddingStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 拍卖所有者操作区域 */}

      <div className="row">
        <div className="col-lg-12">
          <h3>Auction Operations</h3>
          <div className="well card mt-10">
            <div className="auction-operations-buttons">
              <button
                className="btn btn-default"
                onClick={cancelAuction}
                disabled={
                  isLoading ||
                  auctionData.state === "Cancelled" ||
                  auctionData.state === "Destructed"
                }
              >
                Cancel auction!
              </button>
              <button
                className="btn btn-default"
                onClick={finalizeAuction}
                disabled={isLoading || auctionData.state === "Destructed"}
                style={{ marginLeft: "10px" }}
              >
                Finalize auction!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 加载指示器 */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
};

export default App;
