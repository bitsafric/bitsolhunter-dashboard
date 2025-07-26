/project-root
    /referral
        __init__.py    # Can be empty, makes the 'referral' folder a Python package
        models.py      # Defines your database models
        schemas.py     # Defines your Pydantic models (including ReferralCreate)
        routes.py      # Defines your API endpoints
        logic.py       # Defines your referral logic
    database.py         # Contains database configuration and `get_db` function

