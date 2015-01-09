$(function () {
	
	function submitForm()
 	{
		console.log('submitting form');
		var form = $( "#registrationForm" );
		var o = {};
		$.each(form.serializeArray(), function() {
	        if (o[this.name] !== undefined) {
	            if (!o[this.name].push) {
	                o[this.name] = [o[this.name]];
	            }
	            o[this.name].push(this.value || '');
	        } else {
	            o[this.name] = this.value || '';
	        }
	    });
		var fields = o;
		console.log('registering: '+JSON.stringify(fields));
		$.post( "/office/registration", fields );
	};
	
	$('.continue-link').on('click', function (e) {

        var currentStep = parseInt($('.navbar a.active').attr('data-id'));
		console.log(currentStep);
		
        if (currentStep == 1) {
            $('.continue-link').text('Click here to register');
		//	$('.continue-link').attr('href', 'submitForm();');
        } else
        if (currentStep + 1 >= $('.navbar a').length) {
			submitForm();
            $('.continue-link').text('Back to home page.')
			$('.continue-link').attr('href', '/website/home.html');
        } else {
			//$('.continue-link').attr('href', '#');
		}

        if (currentStep >= $('.navbar a').length) {
            return;
        }
        $('.navbar a, form .step').removeClass('active');
        $('.navbar a[data-id="' + (currentStep + 1) + '"]').addClass('active');

        $('form .step[data-id="' + (currentStep + 1) + '"]').addClass('active');
        e.preventDefault()
    });
    $('.platform-selector').on('click', 'a', function (e) {

        var currentStep = parseInt($('.navbar a.active').attr('data-id'));
        $('.platform-selector a').removeClass('active');
        $(this).addClass('active');

        e.preventDefault()
    })
});