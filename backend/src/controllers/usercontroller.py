from src.controllers.controller import Controller
from src.util.dao import DAO
import logging
import re

emailValidator = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

class UserController(Controller):
    def __init__(self, dao: DAO):
        super().__init__(dao=dao)

    def get_user_by_email(self, email: str):
        """
        Given a valid email address of an existing account, return the user object contained in the database associated 
        to that user. For now, do not assume that the email attribute is unique. Additionally print a warning message containing the email
        address if the search returns multiple users.

        parameters:
            email -- an email address string 

        returns:
            user -- the user object associated to that email address (if multiple users are associated to that email: return the first one)
            None -- if no user is associated to that email address

        raises:
            ValueError -- in case the email parameter is not valid (i.e., conforming <local-part>@<domain>.<host>)
            Exception -- in case any database operation fails
        """

        email = email.strip()

        if not email or email == '@' or re.search(r'\s', email):
            raise ValueError('Invalid email address')

        if not re.fullmatch(emailValidator, email):
            raise ValueError('Invalid email address')

        try:
            users = self.dao.find({'email': email})
            if len(users) == 0:
                return None
            elif len(users) == 1:
                return users[0]
            else:
                logging.warning("Found more than one user with email %s", email)
                return users[0]
        except Exception as e:
            raise e

    def update(self, id, data):
        try:
            update_result = super().update(id=id, data={'$set': data})
            return update_result
        except Exception as e:
            logging.error(f"Failed to update user with id {id}: {str(e)}")
            raise
