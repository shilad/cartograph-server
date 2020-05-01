// This script renders the radio checkboxes in the user study and
// handles the navigational workflow
// Author: Rock Pang

function Study(parentContainer) {
    this.parentContainer = parentContainer;
    this.tasks = parentContainer.find('.task');
    this.currentIndex = 0;
    this.url = "";

    this.tasks.push($('#surveyQuestions1'));
    this.tasks.push($('#surveyQuestions2'));
    this.tasks.push($('#surveyQuestions3'));
    this.tasks.push($('#thankYou'));
    /// need to incorporate file reading

    for(var i = 0; i < this.tasks.length; i++) {
        if(i == this.currentIndex) {
            $(this.tasks[i]).show();
        } else {
            $(this.tasks[i]).hide();
        }
    }

    this.next = function() {
        let currTask = $(this.tasks[this.currentIndex]);
        let currForm = currTask.find("form");
        let values = getValues(currForm);

        // validate the form
		let errorP = $(currForm).find(".error");
		alert(errorP.attr("class"));
		alert($(currForm).find(":checked").length);
		if($(currForm).find(":checked").length < 10) {
			errorP.html(htmlEncode("You need to fill out all labels")).fadeIn(500);
			return this;
		}
		errorP.text('').hide();

		// Generate url and logging
		for(var label_key in values) {
			this.url += "&" + label_key + "=" + values[label_key];
		}
        CG.log({ event : 'study', 'formid' : currForm.id, values : values, index : this.currentIndex });

        // Transition to the next form
        var nextTask = (this.currentIndex < this.tasks.length-1)
			? $(this.tasks[this.currentIndex + 1])
			: null;

        alert(this.url);

		currTask.fadeOut(200, function () {
			if (nextTask) nextTask.fadeIn(100);
		});

		this.currentIndex++;

		return this;
    };

    var thisSurvey = this;
	this.parentContainer.on('click', '[data-action=next]', function(e){
		e.preventDefault();
		thisSurvey.next();
	});
}

function getValues(form) {
	var values = {};
	$.each(form.serializeArray(), function(i, field) {
		values[field.name] = field.value;
	})
	alert(values['label1']);
	return values;
}

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}

function showCartoDemo() {
	var cityHolder = $("#cityHolder")[0];

	introJs()
		.onbeforechange(function(targetElement) {
			if (targetElement == cityHolder) {
				$(cityHolder).show();
			} else {
				$(cityHolder).hide();
			}
		})
		.setOption('overlayOpacity', 0.5)
		.start();
}

function showSurveyQuestions() {
	var dic = { 1 : ["Hi", "a", "b", "c", "d", "e", "f", "g", "h", "i"],
		2 : ["Hi", "az", "bz", "cz", "d", "e", "f", "g", "h", "i"],
		3 : ["malayian states", "food and drinks", "Chinese states", "Korean Barbecue", "Japanese Sushi", "Indonesia Seafood",
			"Vietnamese Pho", "Nepalese Food", "Taiwanese Desert", "Indian Curry"]
	};
	let ratings = ["Very Bad", "Bad", "Somewhat Bad", "Neutral", "Somewhat Good", "Good", "Very Good"];

	for(var i = 1; i <= Object.keys(dic).length; i++) {
		 let country = $('#country' + i);
		 var htmlStr = "<label class='likertStatement'>Potential Labels for Country " + i + "</label>" +
			 "<div class='container'>";

		 var labels = dic[i];
		 for (var j = 0; j < labels.length; j++) {
			 var labelhtmlStr =
				 "<div class='row'>" +
					"<div class='col-2'>" + dic[i][j] + "</div>" +
					"<div class='col-10'>" +
						"<ul class='likert'>";

			 for (var k = 0; k < 7; k++) {
				 labelhtmlStr += " " + // necessary
					 "<li>" +
						 "<input type='radio' name='label" + j + "' value='" + ratings[k] + "'>" +
						 "<label>" + ratings[k] + "</label>" +
					 "</li>"
			 }

			 labelhtmlStr += "</ul></div></div>";
			 htmlStr += labelhtmlStr;
		 }
		 htmlStr += "<div class='row'>" +
			 			"<div class='col-2'>" +
			 				"<input data-action=\"next\" type='submit' name='submit' value='Submit'/>" +
			 			"</div>" +
			 			"<div class='col-10'>" +
			 				"<p class=\"error\">&nbsp;</p>" +
			 			"</div>" +
			 		"</div>";

		 htmlStr += "</div>";
		 country.append(htmlStr);
	 }
}

$(document).ready(function() {
	showSurveyQuestions();

	$('#startStudyButton').click(function() {
		$('body').chardinJs('start'); // Show the directions
		$('#introContainer').hide();
		showCartoDemo();
	});
	CG.log({ event : 'startSurvey' });
});























