from typing import Optional, Dict

# In-memory data stores (replace with DB integration later)
user_wallets: Dict[str, Dict[str, float]] = {}
referral_tree: Dict[str, str] = {}
treasury_wallet: Dict[str, float] = {"usdt": 0.0, "bitscat": 0.0}

# Referral reward percentages
USDT_REFERRAL_PERCENTAGES = [0.14, 0.06, 0.03]      # Levels 1 to 3
BITSCAT_REFERRAL_PERCENTAGES = [0.32, 0.12, 0.06]   # Levels 1 to 3

def credit_wallet(user: str, usdt: float, bitscat: float):
    if user not in user_wallets:
        user_wallets[user] = {"usdt": 0.0, "bitscat": 0.0}
    user_wallets[user]["usdt"] += usdt
    user_wallets[user]["bitscat"] += bitscat

def distribute_to_referral_levels(start_user: str, usdt_total: float, bitscat_total: float):
    current_user = start_user
    for level in range(3):
        if current_user not in referral_tree:
            break
        referrer = referral_tree[current_user]
        usdt_reward = usdt_total * USDT_REFERRAL_PERCENTAGES[level]
        bitscat_reward = bitscat_total * BITSCAT_REFERRAL_PERCENTAGES[level]
        credit_wallet(referrer, usdt_reward, bitscat_reward)
        current_user = referrer

def handle_referral_payment(referred_user: str, referral_code: Optional[str], usdt_amount: float, bitscat_amount: float):
    if referral_code and referred_user not in referral_tree:
        referral_tree[referred_user] = referral_code
        distribute_to_referral_levels(referred_user, usdt_amount, bitscat_amount)
    else:
        print(f"No referral applied for {referred_user}")

    # Calculate treasury's share
    usdt_used = sum([usdt_amount * p for p in USDT_REFERRAL_PERCENTAGES])
    bitscat_used = sum([bitscat_amount * p for p in BITSCAT_REFERRAL_PERCENTAGES])

    treasury_wallet["usdt"] += usdt_amount - usdt_used
    treasury_wallet["bitscat"] += bitscat_amount - bitscat_used

def process_payment_and_referral(referred_user: str, referral_code: Optional[str], usdt: float, bitscat: float):
    if referred_user not in user_wallets:
        user_wallets[referred_user] = {"usdt": 0.0, "bitscat": 0.0}
    handle_referral_payment(referred_user, referral_code, usdt, bitscat)

# 🧪 Test Example
if __name__ == "__main__":
    # Setup test tree: A → B → C → D (D is new user, referred by C)
    user_wallets["userA"] = {"usdt": 0.0, "bitscat": 0.0}
    user_wallets["userB"] = {"usdt": 0.0, "bitscat": 0.0}
    user_wallets["userC"] = {"usdt": 0.0, "bitscat": 0.0}

    referral_tree["userB"] = "userA"
    referral_tree["userC"] = "userB"

    # Now userD joins with referral from userC
    process_payment_and_referral("userD", "userC", 100, 50)

    print("\n=== Final Wallets ===")
    print("User Wallets:", user_wallets)
    print("Referral Tree:", referral_tree)
    print("Treasury Wallet:", treasury_wallet)

