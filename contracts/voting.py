from pyteal import *

def approval_program():
    """
    TrustCampus Voting Smart Contract
    
    Handles:
    - create_proposal: [proposal_id, title, deadline_timestamp]
    - cast_vote: [proposal_id, vote_choice (YES/NO/ABSTAIN)]
    
    All vote data is logged on-chain for transparency.
    """

    # Create proposal - log by creator (teacher/HOD)
    create_proposal = Seq([
        Assert(Txn.application_args.length() == Int(3)),
        Log(Concat(
            Bytes("PROPOSAL:"),
            Txn.application_args[0],  # proposal_id
            Bytes(":"),
            Txn.application_args[1],  # title
            Bytes(":"),
            Txn.application_args[2],  # deadline
            Bytes(":"),
            Txn.sender()              # creator address
        )),
        Approve()
    ])

    # Cast vote - log voter's choice on-chain
    cast_vote = Seq([
        Assert(Txn.application_args.length() == Int(2)),
        Log(Concat(
            Bytes("VOTE:"),
            Txn.application_args[0],  # proposal_id
            Bytes(":"),
            Txn.application_args[1],  # choice (YES/NO/ABSTAIN)
            Bytes(":"),
            Txn.sender()              # voter address
        )),
        Approve()
    ])

    # Route based on first arg
    handle_noop = Cond(
        [Txn.application_args[0] == Bytes("create_proposal"), 
         Seq([
             Assert(Txn.application_args.length() == Int(4)),  # method + 3 args
             Log(Concat(
                 Bytes("PROPOSAL:"),
                 Txn.application_args[1],
                 Bytes(":"),
                 Txn.application_args[2],
                 Bytes(":"),
                 Txn.application_args[3]
             )),
             Approve()
         ])
        ],
        [Txn.application_args[0] == Bytes("cast_vote"),
         Seq([
             Assert(Txn.application_args.length() == Int(3)),  # method + 2 args
             Log(Concat(
                 Bytes("VOTE:"),
                 Txn.application_args[1],
                 Bytes(":"),
                 Txn.application_args[2],
                 Bytes(":FROM:"),
                 Txn.sender()
             )),
             Approve()
         ])
        ],
        [Int(1), Err()]  # Unknown method
    )

    return Cond(
        [Txn.application_id() == Int(0), Approve()],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
        [Txn.on_completion() == OnComplete.DeleteApplication, 
         Return(Txn.sender() == Global.creator_address())],
    )

if __name__ == "__main__":
    with open("voting_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
        print("Voting contract compiled to voting_approval.teal")
