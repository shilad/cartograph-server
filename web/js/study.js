$('.task input').on("change", function() {
    let selected = $('input[name=cluster]:checked', '.task').val();

    if(selected === "other") {
        $("#label6").show();
        $("#label6").keyup(function() {
            let customLabel = $("#label6").val();
            $("#other").val(customLabel)
        });
    } else {
        $("#label6").hide();
    }
})



function Study(parentContainer) {
    this.parentContainer = parentContainer;
    this.tasks = parentContainer.find('.task');
    this.currentIndex = 0;
    this.url = "";

    var constraints = {
        task1 : {
            cluster : { required: true }
        },
        task2 : {
            cluster : { presence: true }
        }
    };

    this.tasks.push($('#surveyQuestions1'));
    this.tasks.push($('#surveyQuestions2'));
    this.tasks.push($('#surveyQuestions3'));
    this.tasks.push($('#thankYou'));

    for(var i = 0; i < this.tasks.length; i++) {
        if(i == this.currentIndex) {
            $(this.tasks[i]).show();
        } else {
            $(this.tasks[i]).hide();
        }
    }

    this.next = function() {
        let currTask = $(this.tasks[this.currentIndex]);
        let currForm = currTask.find("form")[0];
        let values = validate.collectFormValues(currForm);
        this.url += '&cluster' + this.currentIndex + '=' + values['cluster'];
        // alert(currForm.id);
        // var result = validate(values, constraints[currForm.id]);
        // alert(result);
        // let errorP = $(currForm).find("p.error");
        //
        // if (result) {
        //     var errorMsgs = [];
		// 	for (var k in result) {
		// 		if (result[k].length) {
		// 			errorMsgs.push(htmlEncode(result[k][0]));
		// 		}
		// 	}
		// 	errorP.html(errorMsgs.join('<br/>')).fadeIn(500);
		// 	return this;
        // }
        //
        // errorP.text('').hide();

        // CG.log({ event : 'study', 'formid' : csurrForm.id, values : values, index : this.currentIndex });

        var nextTask = (this.currentIndex < this.tasks.length-1)
			? $(this.tasks[this.currentIndex + 1])
			: null;

        alert(this.url)

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

$(document).ready(function() {
	$('#startStudyButton').click(function() {
		$('body').chardinJs('start'); // Show the directions
		$('#introContainer').hide();
		showCartoDemo();
	});
	CG.log({ event : 'startSurvey' });
});























