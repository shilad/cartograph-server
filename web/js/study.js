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

	for(var i = 1; i <= Object.keys(dic).length; i++) {
		let country = $('#country' + i);
		let htmlStr =
		"<table>" + "<tr>" +
      "<td><div1><h6 style='text-align:left'>Potential Labels for Country " + i + ", colored: " + "</h6></div></td>" +
      "<td><div2> " + "<div style='width:10px;height:20px;border:0px solid #000; '></div></div>" +  "</div> </td>" +
      "<td><div3><div style='width:30px;height:20px;border:1px solid #000; background-color:#00FFFF'></div></div> </td>" +
   "</tr> </table>" +
			 "<div class='container' style='overflow-y: visible;'>" +
				"<div class='row'>" +
					"<div class='col-2'></div>" + " " +
					"<div class='col text-center'>Very Bad</div>" + " " +
//					"<div class='col text-center'>Bad</div>" + " " +
					"<div class='col text-center'>Neutral</div>" + " " +
//					"<div class='col text-center'>Good</div>" + " " +
					"<div class='col text-center'>Very Good</div>" +
				"</div>" ;

		let labels = dic[i];
//		let labelhtmlStr = "<hr>";
		for(var j = 0; j < labels.length; j++) {
			let labelhtmlStr = "<hr>";
			labelhtmlStr += "<div class='mydiv'>" +
				"<div class='row h-100'>" +
					"<div class='col text-center'>" + dic[i][j] + "</div>";
			for(var k = 0; k < ratings.length; k++) {
				labelhtmlStr += " " +
					"<div class='col' >" +
						"<input type='radio' name='label" + j + "' value='" + ratings[k] + "'>" +
					"</div>"
			}

			labelhtmlStr += "</div>"
			labelhtmlStr += "</div>" ;
//			labelhtmlStr += "<div class='w-100'> </div>"

			htmlStr += labelhtmlStr;
		}
		htmlStr+="<hr>";
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























