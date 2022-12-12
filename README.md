#A GLIMPSE UPON THIS ALGHORITM#

This block of code create encoced path through 2 pools.

```
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

                for(let i3 = 0; i3 < poolsWithFees.length; i3++){
                    routes.push({
                        input: poolsWithFees[i3].token1,
                        poolAddress: poolsWithFees[i3].address,
                        fee: poolsWithFees[i3].fee,
                        between: poolsWithFees[i3].token0
                    })
                }

                //FINAL STEP

                for(let i4 = 0; i4 < routes.length; i4++){
                const encodedRoute = ethers.utils.defaultAbiCoder.encode(
                    [
                        'address', 'uint256', 'address',
                        'address', 'uint256', 'address'
                    ],
                    [
                        input, routes[i4].fee, routes[i4].between,
                        routes[i4].between, routes[i4].fee, output
                    ]
                )

                data.push({
                    input: input,
                    poolAddress: routes[i4].poolAddress,
                    fee: routes[i4].fee,
                    between: routes[i4].between,
                    encoded: encodedRoute
                })

                console.log(data)
            

                    //const amountOut = await quoterV2.callStatic.quoteExactInput(encodedRoute, '1000000000000000000')
                    // amountOuts.push(amountOut.amountOut)
                }

        }
```

This block of code create encoced path through 3 pools all fee tiers.

```
        //ROUTES FOR INPUT - FEE - BETWEEN - BETWEEN - FEE - BETWEEN1 - OUTPUT
        for(let i5 = 0; i5 < PAIRS_TO_CHECK_TRADE_AGAINST.length; i5++){
            for(let i6 = 0; i6 < data.length; i6++){
                for(let i7 = 0; i7 < poolsWithFees.length; i7++){
                    if(PAIRS_TO_CHECK_TRADE_AGAINST[i5].address !== data[i6].between){
                        const encodedRoute = ethers.utils.defaultAbiCoder.encode(
                            [
                                'address', 'uint256', 'address',
                                'address', 'uint256', 'address',
                                'address', 'uint256', 'address'
                            ],
                            [
                                input, data[i6].fee, data[i6].between,
                                data[i6].between, data[i6].fee, PAIRS_TO_CHECK_TRADE_AGAINST[i5].address,
                                PAIRS_TO_CHECK_TRADE_AGAINST[i5].address, poolsWithFees[i7].fee, output
                            ]
                        )    
            
                        data.push({
                            input: input,
                            poolAddress: poolsWithFees[i7].address,
                            fee: data[i6].fee,
                            between: data[i6].between,
                            fee1: poolsWithFees[i7].fee,
                            between1: PAIRS_TO_CHECK_TRADE_AGAINST[i5].address,
                            encoded: encodedRoute
                        })
                    } 
                }   
            }
        }


```