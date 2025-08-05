// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract CoinCircle {
    uint256 public groupCounter;
    mapping(uint256 => Group) public groups;

    struct Group {
        address creator;
        address tokenAddress;
        uint256 contributionAmount;
        uint256 roundDuration;
        uint256 groupSize;
        string payoutType; // "rotation" | "random"
        uint256 currentRound;
        bool started;
        bool completed;
        address[] members;
        mapping(uint256 => mapping(address => bool)) contributions;
        mapping(uint256 => address) roundBeneficiaries;
    }

    event GroupCreated(uint256 groupId, address creator);
    event GroupJoined(uint256 groupId, address member);
    event ContributionMade(uint256 groupId, address member, uint256 round);
    event PayoutTriggered(uint256 groupId, address beneficiary, uint256 round);
    event WithdrawalMade(uint256 groupId, address member);

    modifier onlyMember(uint256 groupId) {
        require(isMember(groupId, msg.sender), "Not a group member");
        _;
    }

    function createGroup(
        uint256 contributionAmount,
        uint256 roundDuration,
        uint256 groupSize,
        address tokenAddress,
        string memory payoutType
    ) external {
        uint256 groupId = groupCounter++;

        Group storage g = groups[groupId];
        g.creator = msg.sender;
        g.tokenAddress = tokenAddress;
        g.contributionAmount = contributionAmount;
        g.roundDuration = roundDuration;
        g.groupSize = groupSize;
        g.payoutType = payoutType;
        g.started = false;
        g.completed = false;

        emit GroupCreated(groupId, msg.sender);
    }

    function joinGroup(uint256 groupId) external {
        Group storage g = groups[groupId];
        require(!g.completed, "Group completed");
        require(!g.started, "Group already started");
        require(!isMember(groupId, msg.sender), "Already a member");
        require(g.members.length < g.groupSize, "Group full");

        g.members.push(msg.sender);

        if (g.members.length == g.groupSize) {
            g.started = true;
        }

        emit GroupJoined(groupId, msg.sender);
    }

    function contribute(uint256 groupId) external onlyMember(groupId) {
        Group storage g = groups[groupId];
        require(g.started, "Group not started");
        require(!g.completed, "Group completed");
        require(!g.contributions[g.currentRound][msg.sender], "Already contributed");

        IERC20(g.tokenAddress).transferFrom(msg.sender, address(this), g.contributionAmount);
        g.contributions[g.currentRound][msg.sender] = true;

        emit ContributionMade(groupId, msg.sender, g.currentRound);
    }

    function triggerPayout(uint256 groupId) external onlyMember(groupId) {
        Group storage g = groups[groupId];
        require(g.started, "Group not started");
        require(!g.completed, "Group completed");

        // Ensure all members have contributed
        for (uint256 i = 0; i < g.members.length; i++) {
            require(g.contributions[g.currentRound][g.members[i]], "Not all members have contributed");
        }

        address beneficiary = _selectBeneficiary(g, groupId);

        IERC20(g.tokenAddress).transfer(beneficiary, g.contributionAmount * g.members.length);

        emit PayoutTriggered(groupId, beneficiary, g.currentRound);

        g.roundBeneficiaries[g.currentRound] = beneficiary;
        g.currentRound++;

        if (g.currentRound == g.groupSize) {
            g.completed = true;
        }
    }

    function withdraw(uint256 groupId) external onlyMember(groupId) {
        Group storage g = groups[groupId];
        require(g.completed, "Group not completed");

        // Optional logic: allow withdraw of surplus if needed
        emit WithdrawalMade(groupId, msg.sender);
    }

    function getGroupInfo(uint256 groupId) external view returns (
        address creator,
        address tokenAddress,
        uint256 contributionAmount,
        uint256 roundDuration,
        uint256 groupSize,
        string memory payoutType,
        uint256 currentRound,
        bool started,
        bool completed,
        address[] memory members
    ) {
        Group storage g = groups[groupId];
        return (
            g.creator,
            g.tokenAddress,
            g.contributionAmount,
            g.roundDuration,
            g.groupSize,
            g.payoutType,
            g.currentRound,
            g.started,
            g.completed,
            g.members
        );
    }

    function isMember(uint256 groupId, address user) public view returns (bool) {
        Group storage g = groups[groupId];
        for (uint256 i = 0; i < g.members.length; i++) {
            if (g.members[i] == user) return true;
        }
        return false;
    }

    function _selectBeneficiary(Group storage g, uint256 groupId) internal view returns (address) {
        if (keccak256(bytes(g.payoutType)) == keccak256(bytes("rotation"))) {
            return g.members[g.currentRound];
        } else if (keccak256(bytes(g.payoutType)) == keccak256(bytes("random"))) {
            // Simplified random: DO NOT USE IN PRODUCTION
            uint256 index = uint256(keccak256(abi.encodePacked(block.timestamp, groupId))) % g.groupSize;
            return g.members[index];
        } else {
            revert("Invalid payoutType");
        }
    }
}
