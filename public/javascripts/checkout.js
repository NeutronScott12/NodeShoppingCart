Stripe.setPublishableKey('pk_test_bK6BdIshzRxHZsRtXdfTmfg3');

var $form = $('#checkout-form');

$form.submit(function(event){
    $('#charge-error').addClass('hidden');
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val() 
    }, stripeResponseHandler);

    return false;
});

function stripeResponseHandler(status, response){
    if (response.error){
        $('#charge-error').text(response.error.message);
        $('#charge-error').removeClass('hidden');
        $('button').prop('disabled', false);
    } else {
        var token = response.id

        $form.append($('<input type="hidden" name="stripeToken" />').val(token));

        $form.get(0).submit();
    }
}

// .card.createToken({
//   number: '4242424242424242',
//   exp_month: 12,
//   exp_year: 2017,
//   cvc: '123'
// }, function(status, response) {
//   // response.id is the card token.
// });