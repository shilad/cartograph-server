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
		if($(currForm).find(":checked").length < 10) {
			errorP.html(htmlEncode("You need to fill out all labels")).fadeIn(500);
			return this;
		}
		errorP.text('').hide();

		// Generate url and logging  TODO: Remove URL
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

function process(response) {
	var dic = {};
	var allRows = response.split(/\r?\n|\r/);
	for(var singleRow = 0; singleRow < allRows.length; singleRow++) {
		var rowCells = allRows[singleRow].split(',');
		var country = rowCells[1];
		var label = rowCells[2];
		if(!(country in dic)) {
			dic[country] = [];
		}
		dic[country].push(label);
	}
	return dic;
}

function shuffleDic(dic) {
	var newDic = {}
	for(var country in dic) {
		var label_arr = dic[country];
		var curr_index = label_arr.length, temp_value, rand_index;
		while(0 != curr_index) {
			rand_index = Math.floor(Math.random() * curr_index);
			curr_index -= 1;

			temp_value = label_arr[curr_index];
			label_arr[curr_index] = label_arr[rand_index];
			label_arr[rand_index] = temp_value;
		}
		newDic[country] = label_arr;
	}
	return newDic;
}

function readFromCSV() {
	$.ajax({
		type: "GET",
		url: "./food-candidate-labels.csv",
		dataType: "text",
		success: function (response) {
			var dic = {};
			var allRows = response.split(/\r?\n|\r/);
			for(var singleRow = 0; singleRow < allRows.length; singleRow++) {
				var rowCells = allRows[singleRow].split(',');
				var country = rowCells[1];
				var label = rowCells[2];
				if(!(country in dic)) {
					dic[country] = [];
				}
				dic[country].push(label);
			}
			var shuffledDic = shuffleDic(dic);
			showSurveyQuestions(shuffledDic);
		}
	});
}

function adjustColor(color) {
	// takes in a raw color string eg "#ffffff"
	// ClusterMetric adjustCountryColor
	// return new hsvtorgb
}


function showSurveyQuestions(dic) {
	//TODO: avoid caching
	// var dic = { 3 : ["Hi", "a", "b", "c", "d", "e", "f", "g", "h", "i"],
	// 	2 : ["Hi", "az", "bz", "cz", "d", "e", "f", "g", "h", "i"],
	// 	1 : ["malayian states", "food and drinks", "Chinese states", "Korean Barbecue", "Japanese Sushi", "Indonesia Seafood",
	// 		"Vietnamese Pho", "Nepalese Food", "Taiwanese Desert", "Indian Curry"]
	// };
	// var dic = readFromCSV(directory)
	//
	// var dic = readFromCSV();
//	let ratings = ["Very Bad", "Bad", "Neutral", "Good", "Very Good"];
	let ratings = ["Very Bad", "Neutral", "Very Good"];
	let colors = ['table-danger', 'table-warning', 'table-success'];
	let countryColors = ['#e9e1be', '#ddcdd3', '#d8e5bf', '#fcb2b2', '#a997ca', '#f7d583',
						'#76abea', '#f0cab2', '#b6e7e0', '#f5b2cc', '#bccfb9'];

	for(var i = 1; i <= Object.keys(dic).length; i++) {
		let country = $('#country' + i);
		let htmlStr =
			"<div class='container' style='display: flex; justify-content: space-around'>" +
				"<div><h6>Potential Labels for Country " + i + "</h6></div>" +
				"<div class='card' style=\"width:30px; height: 20px; background-color: " + adjustColor(countryColors[i-1]) + "\"></div>" +
			"</div>" +

			"<table class='table'>" +
				"<thead>" +
					"<tr>" +
						"<th scope='col'></th>" +
						"<th scope='col' style='width: 15%'>Very Bad</th>" +
						"<th scope='col' style='width: 15%'>Neutral</th>" +
						"<th scope='col' style='width: 15%'>Very Good</th>" +
					"</tr>" +
				"</thead>" +
				"<tbody>";

		let labels = dic[i];
		for(var j = 0; j < labels.length; j++) {
			let labelhtmlStr =
					"<tr>" +
						"<th scope='row' style='pointer-events:none;'>"  + dic[i][j] + "</th>";

			for(var k = 0; k < ratings.length; k++) {
				labelhtmlStr += " " +
					"<td class='"+ colors[k] +" text-center'>" +
						"<input type='radio' name='label" + j + "' value='" + ratings[k] + "'>" +
					"</td>";
			}

			labelhtmlStr += "</tr>";
			htmlStr += labelhtmlStr;
		}
		htmlStr += "</tbody></table>";
		htmlStr+= "<p> <label class='taskLabel' for='task2Text'><strong><span></span> Additional missing labels? </label> <textarea name='feedback' id='task2Text' cols='30' rows='2' required></textarea></p>"

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
	readFromCSV();

	$('#startStudyButton').click(function() {
		$('body').chardinJs('start'); // Show the directions
		$('#introContainer').hide();
		showCartoDemo();
	});
	CG.log({ event : 'startSurvey' });
});























