class User < ActiveRecord::Base
  attr_accessible :name, :email, :password, :password_confirmation

  # new in Rails 3, takes care of the authentication logic using bcrypt
  has_secure_password

  # before_save is a callback that gets called before the record is saved to DB
  # downcasing email is to enforce uniqueness as well
  before_save { |user| user.email = email.downcase }
  before_save :create_remember_token

  # http://stackoverflow.com/questions/6101628/regex-to-validate-user-names-with-at-least-one-letter-and-no-special-characters
  # http://guides.rubyonrails.org/active_record_validations_callbacks.html
  VALID_NAME_REGEX = /^[a-zA-Z0-9_]*[a-zA-Z][a-zA-Z0-9_]*$/
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i

  # make sure the name field must exist, and the length of it must
  # not exceed 51, when a new record is created etc.
  validates :name, presence: true, length: { maximum: 50 }, format: { with: VALID_NAME_REGEX }

  # to guarantee real uniqueness of email, need to create a DB index on the email column
  # and require that the index be unique
  validates :email, presence: true, format: { with: VALID_EMAIL_REGEX }, uniqueness: true
  validates :password, presence: true, length: { minimum: 6 }
  validates :password_confirmation, presence: true


  private

  def create_remember_token
    self.remember_token = SecureRandom.urlsafe_base64
  end 

end
