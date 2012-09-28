require 'open-uri'
require 'json'
require 'miro'
require 'fastimage'

# this is the main controller, which provides the following services to the front-end,
# namely:
# - grabbing markup from a different domain
# - calculate dominant color of an image
# - calculate image size
#
class MainController < ApplicationController

  def home
    respond_to do |format|
      format.html
      format.json do
        intent = params[:get]
        url = params[:url]

        case intent

        when 'markup'
          markup_string = open(url).read
          if markup_string.encoding.name != 'UTF-8'
            markup_string.force_encoding('utf-8')
          end
          render :json => JSON.dump(markup_string)

        when 'dcolor'

          # setting different path only for development, not Heroku production
          if Rails.env.development?
            # refer to Miro doc, setting correct path for imagemagick
            if File.exists?('/usr/local/bin/convert')
              Miro.options[:image_magick_path] = '/usr/local/bin/convert'
            else
              Miro.options[:image_magick_path] = "c:/ImageMagick/convert"
            end
          end

          color_array = Miro::DominantColors.new(url).to_rgba

          # by default miro returns 8 dominant colors sorted by percentage
          # we return the first one if all of them are equally opaque
          # otherwise we return the most opaque, ie having greatest alpha value
          chosen_color = color_array.sort_by { |k| -k[3] }[0]

          logger.debug "color array: #{color_array}"
          logger.debug "chosen color: #{chosen_color}"

          render :json => JSON.dump({
            'red'=>chosen_color[0],
            'green'=>chosen_color[1],
            'blue'=>chosen_color[2]
          })

        when 'imgsize'
          size = FastImage.size(url)
          logger.debug size
          render :json => JSON.dump({
            'width' => size[0],
            'height' => size[1]
          })
        end
      end
    end
  end

  def help
  end

  def savePage
    #logger.debug "=== savePage: #{params[:iphoneHtml]}"
    reset_session
    session[:iphoneHtml] = params[:iphoneHtml]
    redirect_to signup_url
  end

  #def test
    #render :layout => false
  #end

end
