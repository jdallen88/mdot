module SessionsHelper

  def sign_in(user)
    cookies.permanent[:remember_token] = user.remember_token

    # using 'self', making current_user accessible in both controllers and views
    self.current_user = user
  end

  def current_user=(user)
    @current_user = user
  end

  def current_user
    @current_user ||= User.find_by_remember_token(cookies[:remember_token])
  end

  def current_user?(user)
    user == current_user
  end

  def signed_in?
    !current_user.nil?
  end

  def sign_out
    self.current_user = nil
    cookies.delete(:remember_token)
  end

  # the following pair of methods are to implement the 'friendly forwarding' feature
  # that is, it tries to remember which action the non-signed-in user was trying to
  # access before signing in, and redirect the now-signed-in user to the designated
  # action
  def redirect_back_or(default)
    redirect_to(session[:return_to] || default)
    session.delete(:return_to)
  end

  def store_location
    session[:return_to] = request.url
  end

end
