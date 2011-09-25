#!/usr/bin/env ruby -wKU

require 'rubygems'
require 'net/http'
require 'net/https'
require 'uri'
require 'pp'
require 'win32console' if RUBY_PLATFORM =~ /mingw32/
require 'colored'
require File.dirname(__FILE__) + '/helpers'

if ARGV.length != 2
  puts "USAGE: geocode-data.rb CITY_NAME input-file.json"
  exit 0
end

APIKEY = "APrcfU4BAAAAIE81NwIAFNc5wuaVRJPy2EwTzTX4HmFFzJwAAAAAAAAAAAA8zpl_YegpwBmHhIc3QYCca0-NEA=="

$city_name = ARGV[0]
$json_file = ARGV[1]
data = JSON.parse(open($json_file).read.to_s)

def parse_geocoder_response(kp, response)
  response = JSON.parse(response)

  if ((not response['response'].nil?) and
      (not response['response']['GeoObjectCollection'].nil?) and
      (not response['response']['GeoObjectCollection']['featureMember'].nil?) and
      (not response['response']['GeoObjectCollection']['featureMember'].empty?) and
      (not response['response']['GeoObjectCollection']['featureMember'][0].nil?) and
      (not response['response']['GeoObjectCollection']['featureMember'][0]['GeoObject'].nil?) and
      (not response['response']['GeoObjectCollection']['featureMember'][0]['GeoObject']['Point'].nil?) and
      (not response['response']['GeoObjectCollection']['featureMember'][0]['GeoObject']['Point']['pos'].nil?))
    ll = response['response']['GeoObjectCollection']['featureMember'][0]['GeoObject']['Point']['pos']
    ll = ll.split(" ")
    kp['lat'] = ll[0]
    kp['lon'] = ll[0]
  else
    pp response
    raise "Unable to parse response"
  end

end

def start_geocoder_request(kp, address)
  url = URI.parse('http://geocode-maps.yandex.ru/1.x/')
  req = Net::HTTP::Post.new(url.path)
  req.set_form_data({
    'geocode' => "#{$city_name}, #{address}",
    'key' => APIKEY,
    'format' => 'json'
  })

  http = Net::HTTP.new(url.host, url.port)
  begin
    res = http.start { http.request(req) }
  rescue Exception => e
    # required to catch "raise Timeout::Error.new()" which otherwise falls through
    puts e.inspect.green
    puts e.backtrace.join("\n").red
  rescue => e
    puts e.inspect.green
    puts e.backtrace.join("\n").red
  end

  case res
  when Net::HTTPSuccess
    parse_geocoder_response(kp, res.read_body)
  end
end

data.each do |kp|
  next if kp['lat'] and kp['lon']
  if kp['name'] =~ /Загадка/i
    if kp['address'].nil?
      puts "'address' field is not provided:".red
      pp kp
    else
      start_geocoder_request(kp, kp['address'])
    end
  else
    start_geocoder_request(kp, kp['name'])
  end
end

def dump_data(file_name, data)
  File.open(file_name, "w+") do |f|
    f << data
  end
  puts "Written #{file_name}"
end

dump_data($json_file, generate_json(data))
