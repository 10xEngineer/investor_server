$(function () {
    $('.continue-link').on('click', function (e) {

        var currentStep = parseInt($('.navbar a.active').attr('data-id'));

        if (currentStep + 1 >= $('.navbar a').length) {
            $('.continue-link').text('Click here to start download')
        }

        if (currentStep >= $('.navbar a').length) {
            return;
        }
        $('.navbar a, form .step').removeClass('active');
        $('.navbar a[data-id="' + (currentStep + 1) + '"]').addClass('active');

        $('form .step[data-id="' + (currentStep + 1) + '"]').addClass('active');
        e.preventDefault()
    })
    $('.platform-selector').on('click', 'a', function (e) {

        var currentStep = parseInt($('.navbar a.active').attr('data-id'));
        $('.platform-selector a').removeClass('active');
        $(this).addClass('active');

        e.preventDefault()
    })
});