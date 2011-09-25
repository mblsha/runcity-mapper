require File.dirname(__FILE__) + '/my_json'

def generate_json(data)
  opts = {:indent => "  ", :space => "", :object_nl => "\n", :array_nl => "\n"}
  JSON.generate(data, opts)
end
