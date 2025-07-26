from sqlalchemy.orm import Session
from .models import Wallet, Referral

# Define the referral reward percentages for USDT and BitsCat
USDT_PERCENTAGES = [0.14, 0.06, 0.03]  # For 3 levels
BITSCAT_PERCENTAGES = [0.32, 0.12, 0.06]  # For 3 levels

def credit_wallet(db: Session, address: str, usdt: float, bitscat: float):
    """
    Credits the specified wallet with the given USDT and BitsCat amounts.
    If the wallet does not exist, it creates a new one.
    """
    wallet = db.query(Wallet).get(address)
    if not wallet:
        wallet = Wallet(address=address)
        db.add(wallet)
    wallet.usdt += usdt
    wallet.bitscat += bitscat
    db.commit()

def get_referral_chain(db: Session, start: str, levels: int = 3):
    """
    Retrieves the referral chain for a given user up to a specified number of levels.
    """
    chain = []
    current = start
    for _ in range(levels):
        referral = db.query(Referral).filter_by(referred=current).first()
        if not referral:
            break
        chain.append(referral.referrer)
        current = referral.referrer
    return chain

def handle_referral_payment(db: Session, user: str, referrer: str, usdt: float, bitscat: float):
    """
    Handles the referral payment process:
    - Tracks the referral chain
    - Distributes rewards to referrers up to 3 levels
    - Credits USDT and BitsCat to referrers' wallets
    - Ensures that any remaining amounts go to the treasury
    """
    # Add the referral to the database if it doesn't exist
    if not db.query(Referral).filter_by(referred=user).first():
        db.add(Referral(referred=user, referrer=referrer))
        db.commit()

    # Get the referral chain up to 3 levels
    chain = get_referral_chain(db, user)

    total_usdt_used = 0
    total_bitscat_used = 0

    # Distribute the rewards to the referral chain
    for level, address in enumerate(chain):
        if level >= len(USDT_PERCENTAGES) or level >= len(BITSCAT_PERCENTAGES):
            break  # Prevents out-of-range access to the reward arrays

        usdt_reward = usdt * USDT_PERCENTAGES[level]
        bitscat_reward = bitscat * BITSCAT_PERCENTAGES[level]

        # Credit the wallet of the referrer for this level
        credit_wallet(db, address, usdt_reward, bitscat_reward)

        total_usdt_used += usdt_reward
        total_bitscat_used += bitscat_reward

    # Treasury receives the remaining USDT and BitsCat amounts
    treasury_address = "treasury"
    credit_wallet(db, treasury_address, usdt - total_usdt_used, bitscat - total_bitscat_used)

