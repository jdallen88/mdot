# Gotta version the gems:
# http://blog.agoragames.com/blog/2010/11/30/to-version-or-not-to-version-your-gems-in-gemfiles/
# ruby gem versioning operators: ~>, => etc. 
# http://docs.rubygems.org/read/chapter/16#page76

source 'https://rubygems.org'

gem 'rails', '3.2.8'
gem 'bootstrap-sass', '~> 2.1.0.0'
gem 'bcrypt-ruby', '~> 3.0.1'
#gem 'will_paginate', '3.0.3'
#gem 'bootstrap-will_paginate', '0.0.6'

group :development, :test do
  gem 'sqlite3', '1.3.5'
end

group :assets do
  gem 'sass-rails',   '3.2.4'
  gem 'coffee-rails', '3.2.2'
  gem 'uglifier', '1.2.3'
end

gem 'jquery-rails', '2.0.2'
gem 'jquery_mobile_rails', '1.1.1'
#gem 'miro', '0.2.1'
gem 'miro', :git => 'git://github.com/rickkoh/miro.git'
gem 'fastimage', '1.2.13'
gem 'font-awesome-sass-rails'
gem 'rmagick', '~> 2.13.1'

gem "devise", "~> 2.1.2"
gem "cancan", "~> 1.6.8"
gem "rolify", "~> 3.2.0"

gem "hominid", "~> 3.0.5"
gem "google_visualr", "~> 2.1.3"
gem "jquery-datatables-rails", "~> 1.11.0"
gem "simple_form", "~> 2.0.2"

group :production do
  gem 'pg', '0.12.2'
end
