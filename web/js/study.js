// This script renders the radio checkboxes in the user study and
// handles the navigational workflow
// Author: Rock Pang

function Study(parentContainer) {
    this.parentContainer = parentContainer;
    this.tasks = parentContainer.find('.task');
    this.currentIndex = 0;
    this.url = "";
    this.mapCenterDic = getMapCenterDic();
    this.logs = []
    this.turkerid = "";
    this.hitid = "";
    this.checksum = "";

    var constraints = {
		customtheme1 : {
			age : { presence: true, numericality : true },
			gender: { presence: true },
			quick: { presence: true },
			explain: { presence: true },
			grouping: { presence: true },
			learned: { presence: true }
		},
		customtheme2 : {
			easy: { presence: true },
			fun: { presence: true },
			successful: { presence: true },
			editFreq: { presence: true },
			genderFreq: { presence: true }
		},
		customtheme3 : {
		}

	};

    this.tasks.push($('#surveyQuestions1'));
    this.tasks.push($('#surveyQuestions2'));
    this.tasks.push($('#thankYou'));

    this.next = function() {
        let currTask = $(this.tasks[this.currentIndex]);
        let currForm = currTask.find("form");
        let values = getValues(currForm);
        // validate the form
		let errorP = $(currForm).find(".error");
		if($(currTask).is(".task")) {
			let labelLength = $(currForm).find(".table").find("tbody").find("tr").length;
			if($(currForm).find(":checked").length  < 1 ){ //< labelLength) {
				errorP.html(htmlEncode("You need to fill out all labels.")).fadeIn(500);
				return this;
			}
		} else {
			var surveyValues = validate.collectFormValues(currForm[0]);
			var result = validate(surveyValues, constraints[currForm[0].id]);
		}

		errorP.text('').hide();


		// Generate url and logging  TODO: Remove URL
		for(var label_key in values) {
			this.url += "&" + label_key + "=" + values[label_key];
		}
        CG.log({ event : 'study', formid : currForm[0].id, values : values, index : this.currentIndex,
                 turkerid : this.turkerid, hitid: this.hitid });


        // Transition to the next form
        var nextTask = (this.currentIndex < this.tasks.length-1)
			? $(this.tasks[this.currentIndex + 1])
			: null;

        if(this.currentIndex + 1 < this.tasks.length - 3) {
	        let queryString = window.location.search;
			let urlParams = new URLSearchParams(queryString);
	        this.turkerid = urlParams.get('turkerid');
			this.hitid = urlParams.get('hitid');
			this.checksum = crc32(this.turkerid + this.hitid);
			document.getElementById("checksum").innerHTML = "<b>" + this.checksum + "</b>";
			alert(this.checksum);
			let mapURL =  "study.html?turkerid=" + this.turkerid + "&hitid=" + this.hitid + "#cluster/7/" + this.mapCenterDic[this.currentIndex + 1][0] + "/" + this.mapCenterDic[this.currentIndex + 1][1];
			window.location.replace(mapURL);
		}

		currTask.fadeOut(200, function () {
			if (nextTask) nextTask.fadeIn(100);
		});

		this.currentIndex++;

		return this;
    };

	for(var i = 0; i < this.tasks.length; i++) {
		if (i == this.currentIndex) {
			$(this.tasks[i]).show();
			var mapURL = "study.html?turkerid=" + this.turkerid + "&hitid=" + this.hitid + "#cluster/7/" + this.mapCenterDic[i][0] + "/" + this.mapCenterDic[i][1];
			window.location.replace(mapURL); 
		} else {
			$(this.tasks[i]).hide();
		}
	}

	var thisSurvey = this;
	this.parentContainer.on('click', '[data-action=next]', function(e){
		e.preventDefault();
		thisSurvey.next();
	});
}


var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

function replaceValues() {
      var topic = window.location.pathname.split("/")[1];
	  var mapName = topic.charAt(0).toUpperCase() + topic.slice(1);
	  $("span.map-name").text(mapName);
      document.getElementById("checksum").innerHTML = "<b>" + this.checksum + "</b>";
	  $("div[data-intro]").attr("data-intro", function(index, text) {
      return text.replace('MAP-NAME', mapName);
      }
   );
}
function getMapCenterDic(){
	let ret = {};
	$.ajax({
		type: "GET",
		url: "./country_centroid.csv",
		dataType: "text",
		async: false,
		success: function(response) {
			var dic = {};
			var allRows = response.split(/\r?\n|\r/);
			for (var singleRow = 1; singleRow < allRows.length - 1; singleRow++) {
				var rowCells = allRows[singleRow].split(',');
				var country = parseInt(rowCells[0]);
				var x = rowCells[1];
				var y = rowCells[2];
				if (!(country in dic)) {
					dic[country] = [];
				}
				dic[country].push(y);
				dic[country].push(x);
			}
			ret = dic;
		}
	});

	return ret;
}

function getValues(form) {
	var values = {};
	$.each(form.serializeArray(), function(i, field) {
		values[field.name] = field.value;
	})
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

const readFromCSV = async () => {
	return new Promise(resolve => {
		$.ajax({
			type: "GET",
			url: "./candidate_labels.csv",
			dataType: "text",
			success: function (response) {
				var dic = {};
				var allRows = response.split(/\r?\n|\r/);
				for (var singleRow = 1; singleRow < allRows.length - 1; singleRow++) {
					var rowCells = allRows[singleRow].split(',');
					var country = rowCells[1];
					var label = rowCells[2];
					if (!(country in dic)) {
						dic[country] = [];
					}
					dic[country].push(label);
				}
				var shuffledDic = shuffleDic(dic);
				showSurveyQuestions(shuffledDic);

				resolve(dic);
			}
		})
	})
}

function showSurveyQuestions(dic) {
	let ratings = ["Very Bad", "   ", "Neutral", "   ", "Very Good"];
	let colors = ['table-primary','table-danger', 'table-primary','table-danger', 'table-primary'];
	let countryColors = ['#e9e1be', '#ddcdd3', '#d8e5bf', '#fcb2b2', '#a997ca', '#f7d583',
						'#76abea', '#f0cab2', '#b6e7e0', '#f5b2cc', '#bccfb9'];

	for(var i = 0; i < Object.keys(dic).length; i++) {
		let country = $('#country' + i);
		let countryLabelText = i + 1;
		let htmlStr =
			"<div class='left_contentlist'> <div class='itemconfiguration' style='padding-left: 30px;'> <div class='task' style='display: flex; justify-content: space-around'>" +
				"<div><h6>Potential Labels for Region " + countryLabelText + ", colored: </h6></div>" +
				"<div class='card' style=\"width:60px; height: 20px; background-color: " + countryColors[i] + "\"></div>" +
			"</div>" +

			"<table class='table'>" +
				"<thead>" +
					"<tr>" +
						"<th scope='col'></th>" +
						"<th scope='col' style='width: 10%'>Very Bad</th>" +
						"<th scope='col' style='width: 10%'> </th>" +
						"<th scope='col' style='width: 8%'>Neutral</th>" +
						"<th scope='col' style='width: 10%'> </th>" +
						"<th scope='col' style='width: 10%'>Very Good</th>" +
					"</tr>" +
				"</thead>" +
				"<tbody>";

		let labels = dic[i];
		for(var j = 0; j < labels.length; j++) {
			let labelhtmlStr =
					"<tr>" +
						"<th scope='row' style='pointer-events:none; text-align:center'>"  + dic[i][j] + "</th>";
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
		htmlStr+= "<p> <label class='taskLabel' for='task2Text'><strong><span></span> Additional missing labels? </label> <textarea name='feedback' id='task2Text' cols='45' rows='2' required></textarea></p>"

		htmlStr += "<div class='row'>" +
			 			"<div class='col-3'>" +
			 				"<input data-action=\"next\" type='submit' name='submit' value='Submit'/>" +
			 			"</div>" +
			 			"<div class='col-7'>" +
			 				"<p class=\"error\">&nbsp;</p>" +
			 			"</div>" +
			 		"</div>";
		htmlStr += "</div> </div> </div>";
		country.append(htmlStr);
	}
}
$(document).ready(function() {
	$('#startStudyButton').click(function() {
		$('body').chardinJs('start'); // Show the directions
		let turkerid = document.forms["IDinfo"]["turkerID"].value;
		let hitid = document.forms["IDinfo"]["hitid"].value;
		if(turkerid != "" && hitid != ""){
		    let curURL = window.location.href;
		    let mapURL = curURL.replace("turkerid=", "turkerid=" + turkerid).replace("hitid=", "hitid=" + hitid);
            window.history.replaceState("", "", mapURL);
            $('#introContainer').hide();
            showCartoDemo();
		}
		else {
		    let errorP = $('#introContainer').find(".error");
		    errorP.html(htmlEncode("You need to fill out your worker ID and HIT ID.")).fadeIn(500);
		}
	});
	CG.log({ event : 'startSurvey' });
});

