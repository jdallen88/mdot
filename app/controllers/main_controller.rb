require 'open-uri'
require 'json'
require 'miro'
require 'fastimage'

class MainController < ApplicationController
  def home
    respond_to do |format|
      format.html
      format.json do
        intent = params[:get]
        url = params[:url]

        case intent

        when 'markup'
          # dictated by charset meta tag on the HTML page, different encoding schemes
          # are used for the returned string. In order for JSON to serialize it we
          # need to convert it to UTF-8
          render :json => JSON.dump(open(url).read.encode('utf-8', 'iso-8859-1'))

        when 'dcolor'

          # setting different path only for development, not Heroku production
          if Rails.env.development?
            # refer to Miro doc, setting correct path for imagemagick
            Miro.options[:image_magick_path] = '/usr/local/bin/convert'
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
end
