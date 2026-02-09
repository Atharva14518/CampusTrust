from pyteal import *

def approval_program():
    student_addr = Txn.application_args[0]
    metadata_hash = Txn.application_args[1]
    
    # Mint NFT via Inner Transaction
    mint_nft = Seq([
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetConfig,
            TxnField.config_asset_total: Int(1),
            TxnField.config_asset_decimals: Int(0),
            TxnField.config_asset_default_frozen: Int(0),
            TxnField.config_asset_name: Bytes("TrustCampus Cert"),
            TxnField.config_asset_unit_name: Bytes("TCC"),
            TxnField.config_asset_url: Concat(Bytes("ipfs://"), metadata_hash),
            TxnField.config_asset_manager: Global.current_application_address(),
            TxnField.config_asset_reserve: Global.current_application_address(),
            TxnField.config_asset_freeze: Global.current_application_address(),
            TxnField.config_asset_clawback: Global.current_application_address(),
        }),
        InnerTxnBuilder.Submit(),
        # Transfer to student
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: InnerTxn.created_asset_id(),
            TxnField.asset_amount: Int(1),
            TxnField.asset_receiver: student_addr,
        }),
        InnerTxnBuilder.Submit(),
        Approve()
    ])

    return Cond(
        [Txn.application_id() == Int(0), Approve()],
        [Txn.on_completion() == OnComplete.NoOp, mint_nft],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == Global.creator_address())],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == Global.creator_address())]
    )

if __name__ == "__main__":
    with open("certificate_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
