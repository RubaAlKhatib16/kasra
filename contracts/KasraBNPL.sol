// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KasraBNPL {
    // Struct to hold the details of a Pay Later agreement
    struct BNPLAgreement {
        uint256 agreementId;
        address buyer;
        address seller;
        uint256 totalAmount; // Total amount in tinybars
        uint256 outstandingBalance; // Remaining balance in tinybars
        uint256 installments;
        uint256 installmentAmount; // Amount per installment in tinybars
        uint256 nextDueDate; // Timestamp of the next due date
        bool isCompleted;
    }

    // Counter for unique agreement IDs
    uint256 private nextAgreementId = 1;

    // Mapping from agreement ID to the agreement details
    mapping(uint256 => BNPLAgreement) public agreements;

    // Mapping from buyer address to a list of their agreement IDs
    mapping(address => uint256[]) public buyerAgreements;

    // Event to log when a new Pay Later agreement is initiated
    event AgreementInitiated(
        uint256 indexed agreementId,
        address indexed buyer,
        address indexed seller,
        uint256 totalAmount,
        uint256 installments
    );

    // Event to log when an installment payment is made
    event InstallmentPaid(
        uint256 indexed agreementId,
        address indexed payer,
        uint256 amountPaid,
        uint256 newBalance
    );

    // Constructor (optional, for future setup)
    constructor() {}

    /**
     * @notice Initiates a new Buy Now, Pay Later agreement.
     * @param _buyer The Hedera account address of the buyer.
     * @param _seller The Hedera account address of the merchant/seller.
     * @param _totalAmount The total purchase amount in tinybars.
     * @param _installments The number of installments.
     * @param _nextDueDate The timestamp for the first installment due date.
     */
    function initiatePayLater(
        address _buyer,
        address _seller,
        uint256 _totalAmount,
        uint256 _installments,
        uint256 _nextDueDate
    ) public returns (uint256) {
        require(_totalAmount > 0, "Amount must be greater than zero");
        require(_installments > 0, "Must have at least one installment");
        require(_nextDueDate > block.timestamp, "Next due date must be in the future");

        uint256 agreementId = nextAgreementId++;
        uint256 installmentAmount = _totalAmount / _installments;

        agreements[agreementId] = BNPLAgreement({
            agreementId: agreementId,
            buyer: _buyer,
            seller: _seller,
            totalAmount: _totalAmount,
            outstandingBalance: _totalAmount,
            installments: _installments,
            installmentAmount: installmentAmount,
            nextDueDate: _nextDueDate,
            isCompleted: false
        });

        buyerAgreements[_buyer].push(agreementId);

        emit AgreementInitiated(
            agreementId,
            _buyer,
            _seller,
            _totalAmount,
            _installments
        );

        // In a real system, the total amount would be transferred to the seller here.
        // For this prototype, we only log the agreement.
        // (address payable(_seller)).transfer(_totalAmount); // Not supported directly in Hedera Solidity for HBAR transfer

        return agreementId;
    }

    /**
     * @notice Records an installment payment.
     * @param _agreementId The ID of the agreement being paid.
     */
    function makeInstallmentPayment(uint256 _agreementId) public payable {
        BNPLAgreement storage agreement = agreements[_agreementId];
        require(agreement.agreementId != 0, "Invalid agreement ID");
        require(!agreement.isCompleted, "Agreement is already completed");
        require(msg.value > 0, "Payment amount must be greater than zero");

        // Calculate the expected installment amount (simplified for prototype)
        uint256 expectedPayment = agreement.installmentAmount;

        // Ensure the payment is at least the expected installment amount
        require(msg.value >= expectedPayment, "Payment is less than the expected installment amount");

        // Update the outstanding balance
        uint256 amountPaid = msg.value;
        if (amountPaid > agreement.outstandingBalance) {
            amountPaid = agreement.outstandingBalance;
        }
        agreement.outstandingBalance -= amountPaid;

        // Check for completion
        if (agreement.outstandingBalance == 0) {
            agreement.isCompleted = true;
        } else {
            // Advance the next due date (simplified: 30 days)
            agreement.nextDueDate += 30 days;
        }

        // Transfer the received HBAR to the seller (simplified for prototype)
        // In a real system, this would be a more complex logic involving the merchant's account.
        // (address payable(agreement.seller)).transfer(msg.value); // Use HTS/HSCS for HBAR transfer

        emit InstallmentPaid(
            _agreementId,
            msg.sender,
            msg.value,
            agreement.outstandingBalance
        );
    }

    /**
     * @notice Retrieves the details of a specific BNPL agreement.
     * @param _agreementId The ID of the agreement.
     * @return The BNPLAgreement struct details.
     */
    function getAgreementDetails(uint256 _agreementId)
        public
        view
        returns (
            uint256,
            address,
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        BNPLAgreement storage agreement = agreements[_agreementId];
        return (
            agreement.agreementId,
            agreement.buyer,
            agreement.seller,
            agreement.totalAmount,
            agreement.outstandingBalance,
            agreement.installments,
            agreement.installmentAmount,
            agreement.nextDueDate,
            agreement.isCompleted
        );
    }

    /**
     * @notice Retrieves all agreement IDs for a given buyer.
     * @param _buyer The Hedera account address of the buyer.
     * @return An array of agreement IDs.
     */
    function getBuyerAgreements(address _buyer)
        public
        view
        returns (uint256[] memory)
    {
        return buyerAgreements[_buyer];
    }
}
