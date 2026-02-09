from pyteal import *

def approval_program():
    class_id = Bytes("class_id")
    timestamp = Bytes("timestamp")
    
    # Check In Action
    handle_check_in = Seq([
        # Verify arguments
        Assert(Txn.application_args.length() == Int(2)),
        
        # Log attendance (Student Addr, Class ID, Timestamp)
        Log(Concat(Txn.sender(), Txn.application_args[0], Txn.application_args[1])),
        
        Approve()
    ])

    return Cond(
        [Txn.application_id() == Int(0), Approve()],
        [Txn.on_completion() == OnComplete.NoOp, handle_check_in],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == Global.creator_address())],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == Global.creator_address())]
    )

if __name__ == "__main__":
    with open("attendance_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
