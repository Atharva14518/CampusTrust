from pyteal import *

def approval_program():
    # Feedback submission
    # Args: [teacher_id, sentiment_score, feedback_hash]
    
    submit_feedback = Seq([
        Assert(Txn.application_args.length() == Int(3)),
        Log(Concat(Bytes("FEEDBACK:"), Txn.application_args[0], Bytes(":"), Txn.application_args[1])),
        Approve()
    ])

    return Cond(
        [Txn.application_id() == Int(0), Approve()],
        [Txn.on_completion() == OnComplete.NoOp, submit_feedback],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
    )

if __name__ == "__main__":
    with open("voting_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
