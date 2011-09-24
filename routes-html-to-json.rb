#!/usr/bin/env ruby -wKU

require 'rubygems'
require 'hpricot'
require 'json'

if ARGV.length != 1
  puts "USAGE: routes-html-to-json.rb input-file.html"
  exit 0
end

html_file = ARGV[0]

class KP
  def initialize(html_dt)
    @name = html_dt.innerText.strip

    html_elem = html_dt
    loop do
      html_elem = html_elem.next_sibling
      break if html_elem.nil? || html_elem.name.downcase == "dt"
      # puts html_elem
      case html_elem['class']
      when 'description'
        @description = html_elem.innerText.strip
      when 'quest'
        @quest = html_elem.innerText.strip
        @quest.gsub!(/\s+(Отгадка|Ответ)$/, '')
      when 'geo'
        lat = (html_elem/"[@class=latitude]")
        lon = (html_elem/"[@class=longitude]")
        @lat = lat[0].innerText.strip if not lat.empty?
        @lon = lon[0].innerText.strip if not lon.empty?
        raise "Unable to parse 'geo' for #{html_elem.to_s}" if @lat.nil? or @lon.nil?
      when 'answer'
        @answer = html_elem.innerText.strip
      when 'longanswer'
        @longanswer = html_elem.innerText.strip
        @longanswer.gsub!(/^Отгадка\s+/, '')
      when 'image'
        @image = (html_elem/"a")[0]['href'].strip
        raise "Unable to parse 'image' for #{html_elem.to_s}" if @image.nil? or @image.empty?
      when 'history'
        @history = html_elem.innerText.strip
      end
    end
  end

  def to_json
    result = {}
    fields = [:name, :description, :quest, :lat, :lon, :answer, :longanswer, :image, :history]
    fields.each do |f|
      next if not instance_variable_defined?("@#{f}")
      var = instance_variable_get("@#{f}")
      var.gsub!(/\s+/, ' ')
      result[f] = var
    end
    return result
  end

  def self.process_html(html_data)
    result = []
    doc = Hpricot(html_data)
    (doc/"dl[@class=route]//dt").each do |dt|
      kp = KP.new(dt)
      result << kp.to_json
      # puts JSON.generate(kp.to_json, opts)
    end
    return result
  end
end

kp_list = KP.process_html(open(html_file))
opts = {:indent => "  ", :space => "", :object_nl => "\n", :array_nl => "\n"}
puts JSON.generate(kp_list, opts)
