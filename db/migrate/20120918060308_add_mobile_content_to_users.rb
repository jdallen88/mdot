class AddMobileContentToUsers < ActiveRecord::Migration
  def change
    add_column :users, :mobile_content, :string
  end
end
