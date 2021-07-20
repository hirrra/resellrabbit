(function () {

  const heroElm = document.getElementById('hero');
  heroElm.addEventListener('mouseover', function() {
    console.log('in');
    document.getElementById('hero').src = '../src/img/hero.gif';
  }, false);
  heroElm.addEventListener('mouseout', function() {
    console.log('out');
    document.getElementById('hero').src = '../src/img/hero-still.jpg';
  }, false);

}())