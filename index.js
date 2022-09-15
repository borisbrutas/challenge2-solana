const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

//call to create new wallets
const createWallet = async (returnPubKey) => {

    const newPair = new Keypair();

    const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
    const privateKey = newPair._keypair.secretKey;

    if (returnPubKey === true)
        return publicKey;

    return privateKey;
};

const fromWallet = new Uint8Array(
    [
        41, 36, 229, 195, 187, 194, 244, 171, 172, 39, 201,
        250, 51, 175, 247, 30, 104, 221, 85, 98, 161, 97,
        121, 195, 219, 236, 235, 195, 119, 115, 118, 158, 63,
        251, 127, 45, 212, 132, 135, 252, 254, 156, 131, 175,
        243, 99, 8, 50, 9, 248, 216, 76, 162, 97, 210,
        122, 0, 44, 237, 16, 47, 85, 43, 31
    ]
);
const toWallet = new Uint8Array(
    [
        73, 145, 21, 253, 43, 203, 83, 31, 252, 172, 197,
        140, 145, 102, 172, 40, 185, 61, 60, 65, 145, 106,
        23, 198, 167, 173, 32, 7, 177, 34, 125, 51, 239,
        0, 98, 165, 87, 144, 253, 201, 66, 217, 75, 149,
        172, 156, 168, 7, 169, 157, 59, 56, 210, 102, 69,
        194, 245, 12, 100, 168, 193, 186, 143, 169
    ]
);

const createConnection = () => {
    return new Connection(clusterApiUrl("devnet"), "confirmed");
}

const getBalance = async (connection, wallet) => {
    const walletBalance = await connection.getBalance(
        new PublicKey(wallet.publicKey)
    );

    return parseInt(walletBalance) / LAMPORTS_PER_SOL;
}

const airDropSol = async (privateKey) => {

    var connection = createConnection();
    var wallet = Keypair.fromSecretKey(privateKey);
    var publicKey = new PublicKey(wallet.publicKey).toString();

    console.log("Airdropping Sol to", publicKey);

    const airDropSignature = await connection.requestAirdrop(
        wallet.publicKey,
        2 * LAMPORTS_PER_SOL
    );

    let latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airDropSignature
    });    

    console.log("Completed airdrop to", publicKey);    
    console.log(`Wallet balance: ${getBalance(connection, wallet)} SOL`);
};

const computeAndTransferSol = async (fromWallet, toWallet) => {
    var fromWallet = Keypair.fromSecretKey(fromWallet);
    var toWallet = Keypair.fromSecretKey(toWallet);
    var connection = await createConnection();

    var fromBalance = await getBalance(connection, fromWallet);
    var toBalance = await getBalance(connection, toWallet);

    console.log(`Balances: \nfrom ${fromBalance} \nto ${toBalance}`);
    console.log("Starting transfer");

    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromWallet.publicKey,
            toPubkey: toWallet.publicKey,
            lamports: (fromBalance/2) * LAMPORTS_PER_SOL
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet]
    );

    console.log('Signature is ', signature);
    fromBalance = await getBalance(connection, fromWallet);
    toBalance = await getBalance(connection, toWallet);

    console.log(`New balances: \nfrom ${fromBalance} \nto ${toBalance}`);
};

//console.log(createWallet());
computeAndTransferSol(fromWallet, toWallet);
