const express = require('express')
const bodyParse = require('body-parser')
const ethers = require('ethers')
const cors = require('cors');
const SWAP_ROUTER = require('./SwapRouter.json')
const QUOTER_V2_ABI = require('./QuoterV2.json')

const json = bodyParse.json
const app = express();
const router = express.Router()
const provider = new ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/X_71lyvSJ09ASLV4smEvvVs2ZY-vSJ5h`)
const ROUTER_ADDRESS = '0x3c3f75408924Ca5cF64522536FC8aFb7864dC190'
const FACTORY_ADDRESS = '0x8eB105CFc7ec7ebF126586689683a9104E6ec91b' 
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const QUOTER_V2_ADDRESS = '0x11f1e7DF6CF2E441BD5AE2d01b1aA79B6E52cBCa'


app.use(json());
app.use(router);
const PORT = process.env.PORT || 5000
var server_host = process.env.YOUR_HOST || '0.0.0.0';
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://tangleswap.exchange',
    'https://frontend-ts-dapp.vercel.app',
    'https://tangleswap-api.herokuapp.com/',
    'https://backend.tangleswap.exchange/'
  ],
};



app.listen(PORT, server_host, () => {
    console.log(`server is listening on port: ${PORT}`)
})

const factoryABI = [
    "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
    "function enableFeeAmount(uint24 fee, int24 tickSpacing) public",
    `  function getPool(
          address tokenA,
          address tokenB,
          uint24 fee
        ) external view returns (address pool)`,
  ]

const swapRouter = new ethers.Contract(ROUTER_ADDRESS, SWAP_ROUTER.abi, provider)
const quoterV2 = new ethers.Contract(QUOTER_V2_ADDRESS, QUOTER_V2_ABI.abi, provider)
const factory = new ethers.Contract(FACTORY_ADDRESS, factoryABI, provider)
const PAIRS_TO_CHECK_TRADE_AGAINST = [
    {name: 'Shimmer', symbol: 'SMR', address:'0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'}, //SHIMER
    {name:'IOTA', symbol: 'MIOTA', address:'0x3D0AaF7780346243e74B6De1BfFdE88D5a865aEF'}, //IOTA
    {name: 'USDC', symbol:'USDC', address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'}, //USDC
    {name: 'TETHER', symbol: 'USDT', address: '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C'}, //TETHER
    {name: 'Wrapped Bitcoin', symbol: 'WBTC', address:'0xF0CB01f304C657fdD2492bAd6C2c29CFCDc74AF7'}, //BTC
    {name: 'Wrapped Ether', symbol: 'WETH', address: '0xa640caE63fBd297dAE85f67E2637203158533a79'}, //ETH
]

const FEE_TIERS = [
    100,
    500,
    3000,
    10000
]

const ISwapRouter = new ethers.utils.Interface(SWAP_ROUTER.abi)
async function main(){
// router.get('/router/:input/:output/:routerAddress', cors(corsOptions), async (req, res) => {
    const input = '0x288127Fe23304C8a2636529376A21e904327151C' //req.params.input
    const output =  '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6' //req.params.output
    //const routerAddress = req.params.routerAddress
    let poolsWithFees = []
    let routes = []
    let amountOuts = []
    let data = []
    try {

        //ROUTES FOR INPUT - FEE - BETWEEN - FEE -OUTPUT
        for(let i1 = 0; i1 < PAIRS_TO_CHECK_TRADE_AGAINST.length; i1++){

            for(let i2 = 0; i2 < FEE_TIERS.length; i2++){
                const poolPerFee = await factory.getPool(input, PAIRS_TO_CHECK_TRADE_AGAINST[i1].address, FEE_TIERS[i2])
                console.log(poolPerFee, 'poolPerFee')
                console.log(i2, 'iterable')
                if(poolPerFee !== ZERO_ADDRESS){
                    poolsWithFees.push({
                        token0: PAIRS_TO_CHECK_TRADE_AGAINST[i1].address,
                        token1: input,
                        address: poolPerFee,
                        fee: FEE_TIERS[i2]
                    })
                }
            }


                for(let i4 = 0; i4 < poolsWithFees.length; i4++){
                const encodedRoute = ethers.utils.defaultAbiCoder.encode(
                    [
                        'address', 'uint256', 'address',
                        'address', 'uint256', 'address'
                    ],
                    [
                        input, poolsWithFees[i4].fee, poolsWithFees[i4].token0,
                        poolsWithFees[i4].token0, poolsWithFees[i4].fee, output
                    ]
                )

                data.push({
                    input: input,
                    poolAddress: poolsWithFees[i4].poolPerFee,
                    fee: poolsWithFees[i4].fee,
                    between: poolsWithFees[i4].token0,
                    betweenSymbol: PAIRS_TO_CHECK_TRADE_AGAINST[i4].symbol,
                    encoded: encodedRoute
                })

                }

        }

        //ROUTES FOR INPUT - FEE - BETWEEN - BETWEEN - FEE - BETWEEN1 - OUTPUT
        for(let i5 = 0; i5 < PAIRS_TO_CHECK_TRADE_AGAINST.length; i5++){
            for(let i6 = 0; i6 < PAIRS_TO_CHECK_TRADE_AGAINST.length; i6++){
                for(let i7 = 0; i7 < poolsWithFees.length; i7++){
                    for(let i8 = 0; i8 < poolsWithFees.length; i8++){
                        const encodedRoute = ethers.utils.defaultAbiCoder.encode(
                            [
                                'address', 'uint256', 'address',
                                'address', 'uint256', 'address',
                                'address', 'uint256', 'address'
                            ],
                            [
                                input, poolsWithFees[i7].fee, PAIRS_TO_CHECK_TRADE_AGAINST[i5].address,
                                PAIRS_TO_CHECK_TRADE_AGAINST[i5].address, poolsWithFees[i7].fee, PAIRS_TO_CHECK_TRADE_AGAINST[i6].address,
                                PAIRS_TO_CHECK_TRADE_AGAINST[i6].address, poolsWithFees[i8].fee, output
                            ]
                        )    
            
                        data.push({
                            input: input,
                            poolAddress: poolsWithFees[i7].address,
                            fee: poolsWithFees[i7].fee,
                            between: PAIRS_TO_CHECK_TRADE_AGAINST[i5].address,
                            betweenSymbol: PAIRS_TO_CHECK_TRADE_AGAINST[i5].symbol,
                            fee1: poolsWithFees[i8].fee,
                            between1: PAIRS_TO_CHECK_TRADE_AGAINST[i6].address,
                            betweenSymbol1: PAIRS_TO_CHECK_TRADE_AGAINST[i6].symbol,
                            encoded: encodedRoute
                        })
                    }
                }   
        }
        //INPUT FEE OUTPUT AMOUNG TwO FEE TIERS
        for(let i9 = 0; i9 < poolsWithFees.length; i9++){
            for(let i10 = 0; i10 < poolsWithFees.length; i10++){
                    const encodedRoute = ethers.utils.defaultAbiCoder.encode(
                        [
                            'address', 'uint256', 'address',
                            'address', 'uint256', 'address'
                        ],
                        [
                            input, poolsWithFees[i9].fee, output,
                            input, poolsWithFees[i10].fee, output,
                        ]
                    )
                    
                    data.push({
                        input: input,
                        poolAddress: poolsWithFees[i9].address,
                        fee: FEE_TIERS[i9],
                        between: 'fee',
                        fee1: poolsWithFees[i10].fee,
                        between1: null,
                        poolAddress1: poolsWithFees[i10].address,
                        encoded: encodedRoute
                    })           
            }
        }

        for(let i11 = 0; i11 < poolsWithFees.length; i11++){
            for(let i12 = 0; i12 < poolsWithFees.length; i12++){
                for(let i13 = 0; i13 < poolsWithFees.length; i13++){
                    const encodedRoute = ethers.utils.defaultAbiCoder.encode(
                        [
                            'address', 'uint256', 'address',
                            'address', 'uint256', 'address',
                            'address', 'uint256', 'address'
                        ],
                        [
                            input, poolsWithFees[i11].fee, output,
                            input, poolsWithFees[i12].fee, output,
                            input, poolsWithFees[i13].fee, output
                        ]
                    )
                    
                    data.push({
                        input: input,
                        poolAddress: poolsWithFees[i11].address,
                        fee: FEE_TIERS[i11],
                        between: 'fee',
                        poolAddress1: poolsWithFees[i12].address,
                        fee1: poolsWithFees[i12].fee,
                        between1: null,
                        poolAddress2: poolsWithFees[i13].address,
                        fee2: poolsWithFees[i13].fee,
                        encoded: encodedRoute
                    })           
            }
        }
    }
}
        console.log(data, 'data')
    } catch (error) {
        console.log(error)
    }


    // return res.json(posArr)
// })
}
main()