require 'open-uri'
require 'json'
require 'Miro'
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
          render :json => JSON.dump(open(url).read)
        when 'dcolor'
          Miro.options[:image_magick_path] = '/usr/local/bin/convert'
          color = Miro::DominantColors.new(url).to_rgb[0]
          logger.debug color
          render :json => JSON.dump({
            'red' => color[0],
            'green' => color[1],
            'blue' => color[2]
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
