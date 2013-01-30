var Factory = require("../lib/factory")
  , Backbone = require("backbone")
  , expect = require("expect.js")

describe("When I specify a factory", function() {

  it("the generated model should have the properties set.", function() {
    var modelFactory = new Factory(Backbone.Model, {
      title: "This is a title"
    })
    var model = modelFactory.generate()
    expect(model.get("title")).to.be("This is a title")
  })
  it("It should replace sequences", function() {
    var modelFactory = new Factory(Backbone.Model, {
      title: "Title Number {{sequence(1)}}" //title that starts with
    })
    var model1 = modelFactory.generate()
    var model2 = modelFactory.generate()
    expect(model1.get("title")).to.be("Title Number 1")
    expect(model2.get("title")).to.be("Title Number 2")
  }) 
  it("It should replace random strings", function() {
    var modelFactory = new Factory(Backbone.Model, {
      title: "{{random(24, 0-9a-f)}}" //title that starts with
    })
    var model1 = modelFactory.generate()
    var model2 = modelFactory.generate()
    expect(model1.get("title").length).to.be(24)
    expect(model2.get("title")).to.match(/[a-z0-9]{24}/)
  })
})
