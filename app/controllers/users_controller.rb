class UsersController < ApplicationController
  
  # this is an Authorization mechanism
  before_filter :signed_in_user, except: [:new, :create]
  before_filter :correct_user, except: [:new, :create]

  def show
    # passing in hash condition to the where method
    # @user = User.where(:name => request.subdomain).first || User.find(params[:id])
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(params[:user])
    if @user.save

      # signing in the user upon signup
      sign_in @user

      flash[:success] = 'Congratulations on making the first step to mobilify your site!'
      redirect_to @user
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @user.update_attributes(params[:user])
      flash[:success] = "Profile updated"
      sign_in @user
      redirect_to @user
    else
      render 'edit'
    end
  end

  private

  # signed_in_user is only checking to see if the user performing this action is signed-in
  # but doesn't care if it is the correct user, ie the one entitled to edit information
  def signed_in_user
    unless signed_in?
      store_location
      flash[:notice] = 'Please sign in first.'
      redirect_to signin_url
    end
  end

  def correct_user
    @user = User.where(:name => request.subdomain).first || User.find(params[:id])
    unless current_user?(@user)
      # the following flash does not work, why?
      flash[:error] = 'You cannot access someone else\'s account'
      redirect_to root_url(:subdomain => current_user.name)
    end
  end

end
