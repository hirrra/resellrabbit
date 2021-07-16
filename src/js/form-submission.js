(function() {

  // form successfully submitted
  function handleButtonSuccess() {
    submitButton.textContent = "Success!"
    submitButton.classList.remove("button-onclick");
    submitButton.classList.add("button-validate");
    setTimeout(() => {
      submitButton.classList.remove("button-validate");
      submitButton.textContent = buttonContent;
    }, 2000)
  }  

  function showThankyou(form) {
    var thankyou = form.querySelector(".thankyou");
    if (!thankyou) {
      return;
    }
    thankyou.style.display = "block";
    setTimeout(() => {
      thankyou.style.display = "block";
    }, 2000)
    setTimeout(() => {
      thankyou.style.display = "none";
    }, 4000)
  }

  // get all data in form and return object
  function getFormData(form) {
    var elements = form.elements;
    var honeypot;

    var fields = Object.keys(elements).filter(function(k) {
      if (elements[k].name === "honeypot") {
        honeypot = elements[k].value;
        return false;
      }
      return true;
    }).map(function(k) {
      if(elements[k].name !== undefined) {
        return elements[k].name;
      // special case for Edge's html collection
      }else if(elements[k].length > 0){
        return elements[k].item(0).name;
      }
    }).filter(function(item, pos, self) {
      return self.indexOf(item) == pos && item;
    });

    var formData = {};
    fields.forEach(function(name){
      var element = elements[name];
      
      // singular form elements just have one value
      formData[name] = element.value;

      // when our element has multiple items, get their values
      if (element.length) {
        var data = [];
        for (var i = 0; i < element.length; i++) {
          var item = element.item(i);
          if (item.checked || item.selected) {
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }

      // if checkbox, then get the checked value
      if (element.type == 'checkbox') {
        formData[name] = "";
        if (element.checked) {
          formData[name] = element.value;
        } 
      } 
    });

    // add form-specific values into the data
    formData.formDataNameOrder = JSON.stringify(fields);
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
    formData.formGoogleSendEmail
      = form.dataset.email || ""; // no email by default

    return {data: formData, honeypot: honeypot};
  }

  function handleFormSubmit(event) {  // handles form submit without any jquery
    event.preventDefault();           // we are submitting via xhr below
    var form = event.target;
    var formData = getFormData(form);
    var data = formData.data;
    
    // If a honeypot field is filled, assume it was done so by a spam bot.
    if (formData.honeypot) {
      return false;
    }

    // Newsletter forms.
    if (form.name === 'submit-to-invites-signup') {
      // Stop if empty email.
      if (!formData.data.email) {
        return false;
      }
    }

    // Feedback uninstall form.
    if (form.name === 'uninstall-feedback-form') {
      formData.data.plan = window.location.search.substring(1);
    }
    
    showThankyou(form);
    var url = form.action;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    // xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        form.reset();
        // Make sure thank you note is hidden as same time as form cleared.
        var thankyou = form.querySelector(".thankyou");
        thankyou.style.display = "none";
        var formElements = form.querySelector(".form-elements")
        if (formElements) {
          formElements.style.display = "none"; // hide form
        }
        // handleButtonSuccess();
      }
    };
    // url encode form data for sending as post data
    var encoded = Object.keys(data).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
    }).join('&');
    xhr.send(encoded);
  }
  
  function loaded() {
    // bind to the submit event of our form
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }

    // bind click event to submit button to show spinnner
    // submitButton = document.querySelectorAll("button[type='submit']");
    // buttonContent = submitButton.textContent;
    // submitButton.addEventListener("click", function() {
    //   submitButton.classList.add("button-onclick");
    // });
  };
  document.addEventListener("DOMContentLoaded", loaded, false);

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

})();