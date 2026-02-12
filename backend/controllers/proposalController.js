const db = require('../db');

// Get all proposals
exports.getProposals = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM proposals ORDER BY created_at DESC'
        );
        res.json({ success: true, proposals: rows });
    } catch (error) {
        console.error('Get proposals error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create a proposal (Teacher or HOD only)
exports.createProposal = async (req, res) => {
    try {
        const { title, description, creatorAddress, creatorRole, deadlineMinutes, txId } = req.body;

        if (!title || !creatorAddress || !creatorRole) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        if (!['TEACHER', 'HOD'].includes(creatorRole)) {
            return res.status(403).json({ success: false, error: 'Only teachers and HOD can create proposals' });
        }

        if (!txId) {
            return res.status(400).json({ success: false, error: 'Blockchain transaction required. Please sign with your wallet.' });
        }

        const deadline = deadlineMinutes
            ? new Date(Date.now() + deadlineMinutes * 60 * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);

        const [result] = await db.execute(
            'INSERT INTO proposals (title, description, creator_address, creator_role, deadline, tx_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description || '', creatorAddress, creatorRole, deadline, txId]
        );

        res.json({
            success: true,
            message: 'Proposal created on-chain and recorded',
            proposalId: result.insertId,
            txId: txId
        });
    } catch (error) {
        console.error('Create proposal error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Cast a vote
exports.vote = async (req, res) => {
    try {
        const { proposalId, voterAddress, choice, txId } = req.body;

        if (!proposalId || !voterAddress || !choice) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        if (!['YES', 'NO', 'ABSTAIN'].includes(choice)) {
            return res.status(400).json({ success: false, error: 'Invalid vote choice' });
        }

        if (!txId) {
            return res.status(400).json({ success: false, error: 'Blockchain transaction required. Please sign with your wallet.' });
        }

        // Check if proposal exists and is still active
        const [proposals] = await db.execute(
            'SELECT * FROM proposals WHERE id = ?',
            [proposalId]
        );

        if (proposals.length === 0) {
            return res.status(404).json({ success: false, error: 'Proposal not found' });
        }

        const proposal = proposals[0];

        if (!proposal.active) {
            return res.status(400).json({ success: false, error: 'This proposal is no longer active' });
        }

        if (proposal.deadline && new Date(proposal.deadline) < new Date()) {
            return res.status(400).json({ success: false, error: 'Voting deadline has passed' });
        }

        // Check if user already voted
        const [existingVotes] = await db.execute(
            'SELECT id FROM votes WHERE proposal_id = ? AND voter_address = ?',
            [proposalId, voterAddress]
        );

        if (existingVotes.length > 0) {
            return res.status(400).json({ success: false, error: 'You have already voted on this proposal' });
        }

        // Insert vote with blockchain tx reference
        await db.execute(
            'INSERT INTO votes (proposal_id, voter_address, vote_choice, tx_id) VALUES (?, ?, ?, ?)',
            [proposalId, voterAddress, choice, txId]
        );

        // Update vote counts
        const column = choice === 'YES' ? 'yes_votes' : choice === 'NO' ? 'no_votes' : 'abstain_votes';
        await db.execute(
            `UPDATE proposals SET ${column} = ${column} + 1 WHERE id = ?`,
            [proposalId]
        );

        res.json({
            success: true,
            message: 'Vote recorded on-chain and saved',
            txId: txId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, error: 'You have already voted on this proposal' });
        }
        console.error('Vote error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get votes for a proposal
exports.getVotes = async (req, res) => {
    try {
        const { proposalId } = req.query;

        if (!proposalId) {
            return res.status(400).json({ success: false, error: 'Proposal ID required' });
        }

        const [votes] = await db.execute(
            'SELECT * FROM votes WHERE proposal_id = ? ORDER BY timestamp DESC',
            [proposalId]
        );

        res.json({ success: true, votes });
    } catch (error) {
        console.error('Get votes error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
