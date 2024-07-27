import "./App.css";

import { useEffect, useState } from "react";
import { Contract, providers } from "ethers";
import { BrowserProvider } from "ethers";
import NFT from "./abi/horoscopeNFT.json";

const NFT_CONTRACT_ADDRESS = "0x25bC03B9CF7237C1dCE3D112431DDA5409836c48";

function App() {
	const [isWalletInstalled, setIsWalletInstalled] = useState(false);
	const [isMinting, setIsMinting] = useState(false);
	const [NFTContract, setNFTContract] = useState(null);
	const [account, setAccount] = useState(null);
	const [date, setDate] = useState("1992-08-31");
	const [zodiacSign, setZodiacSign] = useState(null);

	useEffect(() => {
		if (window.ethereum) {
			setIsWalletInstalled(true);
		}
	}, []);

	function handleDateInput({ target }) {
		setDate(target.value);
	}

	async function connectWallet() {
		window.ethereum
			.request({ method: "eth_requestAccounts" })
			.then((accounts) => {
				setAccount(accounts[0]);
			})
			.catch((error) => {
				alert("Something went wrong");
			});
	}

	function calculateZodiacSign(date) {
		const dateObject = new Date(date);
		const day = dateObject.getDate();
		const month = dateObject.getMonth();

		const zodiacSigns = [
			{
				sign: "Capricorn",
				start: { month: 11, day: 22 },
				end: { month: 0, day: 19 },
			},
			{
				sign: "Aquarius",
				start: { month: 0, day: 20 },
				end: { month: 1, day: 18 },
			},
			{
				sign: "Pisces",
				start: { month: 1, day: 19 },
				end: { month: 2, day: 20 },
			},
			{
				sign: "Aries",
				start: { month: 2, day: 21 },
				end: { month: 3, day: 19 },
			},
			{
				sign: "Taurus",
				start: { month: 3, day: 20 },
				end: { month: 4, day: 20 },
			},
			{
				sign: "Gemini",
				start: { month: 4, day: 21 },
				end: { month: 5, day: 20 },
			},
			{
				sign: "Cancer",
				start: { month: 5, day: 21 },
				end: { month: 6, day: 22 },
			},
			{
				sign: "Leo",
				start: { month: 6, day: 23 },
				end: { month: 7, day: 22 },
			},
			{
				sign: "Virgo",
				start: { month: 7, day: 23 },
				end: { month: 8, day: 22 },
			},
			{
				sign: "Libra",
				start: { month: 8, day: 23 },
				end: { month: 9, day: 22 },
			},
			{
				sign: "Scorpio",
				start: { month: 9, day: 23 },
				end: { month: 10, day: 21 },
			},
			{
				sign: "Sagittarius",
				start: { month: 10, day: 22 },
				end: { month: 11, day: 21 },
			},
		];

		const zodiacSign = zodiacSigns.find(
			(zodiac) =>
				(month === zodiac.start.month && day >= zodiac.start.day) ||
				(month === zodiac.end.month && day <= zodiac.end.day) ||
				(month > zodiac.start.month && month < zodiac.end.month)
		)?.sign;

		if (zodiacSign) {
			setZodiacSign(zodiacSign);
		}
	}

	useEffect(() => {
		calculateZodiacSign(date);
	}, [date]);

	useEffect(() => {
		function initNFTContract() {
			const provider = new BrowserProvider(window.ethereum);

			provider
				.getSigner()
				.then((signer) => {
					setNFTContract(
						new Contract(NFT_CONTRACT_ADDRESS, NFT.abi, signer)
					);
				})
				.catch((error) => {
					console.error("Error initializing contract:", error);
				});
		}

		initNFTContract();
	}, [account]);

	async function mintNFT() {
		setIsMinting(true);

		try {
			const transaction = await NFTContract.mintNFT(account, zodiacSign);

			await transaction.wait();
		} catch (error) {
			console.error(error);
		} finally {
			alert("Minting successful");
			setIsMinting(false);
		}
	}

	if (!account) {
		return (
			<div className="App">
				{isWalletInstalled ? (
					<button onClick={connectWallet}>Connect Wallet</button>
				) : (
					<p>Install Metamask wallet</p>
				)}
			</div>
		);
	}

	return (
		<div className="App">
			<h1>Horoscope NFT Minting Dapp</h1>
			<p>Connected as: {account}</p>

			<input
				onChange={handleDateInput}
				value={date}
				type="date"
				id="dob"
			/>
			<br />
			<br />
			{zodiacSign ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="xMinYMin meet"
					viewBox="0 0 300 300"
					width="400px"
					height="400px"
				>
					<style>{`.base { fill: white; font-family: serif; font-size: 24px;`}</style>
					<rect width="100%" height="100%" fill="black" />
					<text
						x="50%"
						y="50%"
						class="base"
						dominant-baseline="middle"
						text-anchor="middle"
					>
						{zodiacSign}
					</text>
				</svg>
			) : null}

			<br />
			<br />
			<button disabled={isMinting} onClick={mintNFT}>
				{isMinting ? "Minting..." : "Mint"}
			</button>
		</div>
	);
}

export default App;
