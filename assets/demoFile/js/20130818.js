(function() {
  $(function() {
    return $('.d0818click').click(function(event) {
      event.preventDefault();
      $(".old").animate({
        left: "+=10"
      });
      return $(".new").is(":animated") || $(".new").animate({
        left: "+=10"
      });
    });
  });

}).call(this);
