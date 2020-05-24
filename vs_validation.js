var baseUrl = $('#base_url').val();
var controller = $('#controller').val();
var method = $('#method').val();
var param1 = $('#param1').val();


function ajaxSendWithFile(url, formData, type = 'POST', dataType = 'JSON') {
    var request;
    if (request) { request.abort(); }
    return request = $.ajax({
        url: url,
        type: type,
        dataType: dataType,
        data: formData,
        processData: false,
        contentType: false
    });
}

function ajaxSend(url, formData, type = 'POST', dataType = 'JSON') {
    var request;
    if (request) { request.abort(); }
    return request = $.ajax({
        url: url,
        type: type,
        dataType: dataType,
        data: formData
    });
}


function formSubmit(formId) {

    var formExternalData = $('#formExternalData').val();

    var $form = $('#' + formId + '');
    var $inputs = $form.find("input, select, textarea");
    var fields = $form.serializeArray();
    var formData = new FormData($form[0]);
    if(formExternalData != '') { formData.append('formExternalData',formExternalData); }
    if(controller != '') { formData.append('controller',controller); }
    var formErrors = 0;
    $form.find('.fieldError').remove();
    $.each($inputs, function(key) {
        var fieldError = 0;
        var checkBoxError = 0;
        var regexError = 0;
        var $fieldElement = $(this.tagName + '[name="' + this.name + '"');
        $fieldElement.removeClass('border-red');
        var fieldValue = this.value;
        var errorMsg = '';
        var display = $fieldElement.attr('display');
        var placeholder = $fieldElement.attr('placeholder');
        if (typeof display !== typeof undefined && display !== false) {
            displayName = display
        } else if (typeof placeholder !== typeof undefined && placeholder !== false) {
            displayName = placeholder
        } else {
            displayName = ucwords(this.name);
        }
        var required = $fieldElement.attr('required'); // checking if required
        if (typeof required !== typeof undefined && required !== false) {
            if (fieldValue == '') {
                fieldError = 1;
                errorMsg = displayName + ' is required';
            }
            if ($fieldElement.is(':checkbox') || $fieldElement.is(':radio')) {

                if ($('input[name="' + this.name + '"]:checked').map(function() { return this.value }).get().length < 1) {
                    checkBoxError = 1;
                    errorMsg = displayName + ' is required';
                }
            }
        }
        if (fieldValue != '') {
            var regex = $fieldElement.attr('regex'); // checking regex
            if (typeof regex !== typeof undefined && regex !== false && $fieldElement.is(':text')) {
                var aregex = new RegExp(regex);
                if (!aregex.test(fieldValue)) {
                    fieldError = 1;
                    regexError = 1; // for regex error
                    errorMsg = displayName + ' is not a valid format';
                }
            }
            var min = $fieldElement.attr('min'); // checking  min
            if (typeof required !== typeof undefined && required !== false) {
                if (min > fieldValue.length) {
                    fieldError = 1;
                    errorMsg = displayName + ' Minimum length is ' + min;
                }
            }
            var max = $fieldElement.attr('max'); // checking  max
            if (typeof required !== typeof undefined && required !== false) {
                if (max < fieldValue.length) {
                    fieldError = 1;
                    errorMsg = displayName + ' Maximum length is ' + max;
                }
            }
        }
        if (fieldError == 1) {

            if($fieldElement.closest('.checkboxError').hasClass('checkboxError')) {
                $('input[name="' + this.name + '"]').closest('.checkboxError').find('.fieldError').remove();
                $('input[name="' + this.name + '"]').closest('.checkboxError').append('<div class="text-danger fieldError" id="span_' + key + '"></div>');
            }else {

                $fieldElement.after('<div class="text-danger fieldError" id="span_' + key + '"></div>');
                if (regexError == 1) {
                    var error = $fieldElement.attr('error');
                    if (typeof error !== typeof undefined && error !== false) {
                        errorMsg = error;
                    }
                }
            }
            errorMsg = errorMsg.replace('*', '');
            $('#span_' + key).text(errorMsg);
            formErrors = 1;
            $fieldElement.addClass('border-red');
        }
        if (checkBoxError == 1) {
            var error = $fieldElement.closest('.checkboxError').attr('error');
            if (typeof error !== typeof undefined && error !== false) {
                errorMsg = error;
            }
            $('input[name="' + this.name + '"]').closest('.checkboxError').find('.fieldError').remove();
            $('input[name="' + this.name + '"]').closest('.checkboxError').append('<div class="text-danger fieldError" id="span_' + key + '"></div>');
            $('#span_' + key).text(errorMsg);
            formErrors = 1;
        }
    });
    if (formErrors == 0) {
        var submitBtnText = $form.find('.formSubmitButton').val();
        $form.find('.formSubmitButton').val('Please wait..');
        $('#loader,#overlay').show();
        $inputs.prop("disabled", true);
        ajaxSendWithFile($form.attr('action'), formData).done(data => {

            if (data['status'] == true) {
                $('#formExternalData').val(JSON.stringify(data));
                var redirect = $form.attr('redirect');
                if (typeof redirect !== typeof undefined && redirect !== false) {

                    setTimeout(function () {
                        window.location = redirect;    
                    },1000);
                    
                }
                $form.find('.formSubmitButton').before('<div class="text-success fieldError">' + data['message'] + '</div>');
                //$form.find("input, textarea,select").val('');

                var callback = $form.attr('callback');
                if (typeof callback !== typeof undefined && callback !== false) {
                    window[callback]();
                }

            } else {
                // grecaptcha.ready(function() {
                //     grecaptcha.reset();    
                // });
                $form.find('.formSubmitButton').before('<div class="text-danger fieldError">' + data['message'] + '</div>');
            }
        }).fail(e => { alert('Error in Request, try again.'); }).always(() => {
            $inputs.prop("disabled", false);
            $form.find('.formSubmitButton').val(submitBtnText);
            $('#loader,#overlay').hide();
        });
    }else {
        $form.find('.formSubmitButton').after('<div class="text-danger fieldError"> Please fill all above fields with * </div>');
    }

    $('.border-red').css("border","1px solid red");
} // end formValidation


function urlValidation(url) {
    regex = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/;
}

function ucwords(str) {
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function($1) {
        return $1.toUpperCase();
    });
}

$(document).on('click', '.modalConfirm', function () {
    $('#btn-yes').attr('href',$(this).data('url'));
    $('#modalConfirm').modal();
});


$(document).on('click', '.formSubmitButton', function () {
    if($(this).data('click') == 1) {

    }else {
        var id = $(this).closest("form").attr('id');    
        formSubmit(id);
    }
});


function waiting() {
    var data = $.parseJSON($('#formExternalData').val());
    window.location = baseUrl+'chat/waiting/'+data.userId;
}
