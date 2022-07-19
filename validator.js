function Validator(formSelector) { // options = {} trong -> với ES6

    var _this = this

    var formRules = {}

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
        }
        element = element.parentElement
    }


    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này !'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập trường này là email !'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập mật khẩu có ít nhất  ${min} ký tự !`
            }
        },

    }

    var formElement = document.querySelector(formSelector)


    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')

        for (const input of inputs) {

            var rules = input.getAttribute('rules').split('|')

            for (var rule of rules) {

                var isRuleHasValue = rule.includes(':')

                var ruleInfo

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }

                var ruleFunc = validatorRules[rule]

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                }
                else {
                    formRules[input.name] = [ruleFunc]
                }
            }


            // Lắng nghe sự kiện để validate

            input.onblur = handleValidate
            input.oninput = handleClear
        }

        // Hàm thực hiện Validate
        function handleValidate(e) {
            var rules = formRules[e.target.name]
            var errorMessage
            // rules.some(function (rule) {
            //     errorMessage = rule(e.target.value)
            //     return errorMessage
            // })

            for (var rule of rules) {
                errorMessage = rule(e.target.value)
                if (errorMessage) break
            }
            // Nếu có lỗi thì hiển thị lỗi ra UI
            if (errorMessage) {
                var formGroup = getParent(e.target, '.form-group')
                if (formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage) {
                        formMessage.innerHTML = errorMessage
                    }
                }
            }
            return !errorMessage
        }

        function handleClear(e) {
            var formGroup = getParent(e.target, '.form-group')
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')

                var formMessage = formGroup.querySelector('.form-message')
                if (formMessage) {
                    formMessage.innerHTML = ''
                }
            }
        }

    }

    // Xử lý hành vi Submit
    formElement.onsubmit = function (e) {
        e.preventDefault()

        console.log(_this)

        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true
        for (var input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false
            }
        }
        // Khi không có lỗi thì Submit Form
        if (isValid) {

            if (typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]:not([disabled])') // Select tất cả các attribute là name và không có attribute là disabled
                var formValues = Array.from(enableInputs).reduce(function (values, input) {

                    switch (input.type) {
                        case 'radio':
                            if (input.matches(':checked')) {
                                values[input.name] = input.value
                            }
                            break
                        case 'checkbox':
                            if (!input.matches(':checked')) {
                                // values[input.name] = ''
                                return values
                            }
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = []
                            }
                            values[input.name].push(input.value)
                            break
                        case 'file':
                            values[input.name] = input.files
                            break

                        default:
                            values[input.name] = input.value
                    }

                    return values
                }, {})

                // Gọi làm hàm onSubmit và trả về giá trị của các input
                _this.onSubmit(formValues)
            }
            else {
                formElement.submit()
            }
        }

    }
}