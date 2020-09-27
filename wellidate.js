/*!
 * Wellidate 2.0.0
 * https://github.com/NonFactors/Wellidate
 *
 * Copyright © NonFactors
 *
 * Licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof module === "object" && module.exports) {
        factory(module.exports);
    } else {
        factory(global);
    }
}(this, exports => {
    class WellidateValidatable {
        constructor(wellidate, group) {
            const validatable = this;

            validatable.rules = {};
            validatable.isValid = true;
            validatable.isDirty = false;
            validatable.elements = group;
            validatable.element = group[0];
            validatable.wellidate = wellidate;

            validatable.build();
            validatable.bind();
        }

        validate() {
            const validatable = this;

            validatable.isValid = true;

            for (const method of Object.keys(validatable.rules)) {
                const rule = validatable.rules[method];

                if (rule.isEnabled() && !rule.isValid(validatable)) {
                    validatable.isValid = false;
                    validatable.error(method);

                    break;
                }
            }

            if (validatable.isValid) {
                validatable.success();
            }

            return validatable.isValid;
        }

        reset(message) {
            const validatable = this;
            const wellidate = validatable.wellidate;

            validatable.isDirty = false;
            validatable.element.setCustomValidity("");

            for (const element of validatable.elements) {
                element.classList.remove(wellidate.inputErrorClass);
                element.classList.remove(wellidate.inputValidClass);
                element.classList.remove(wellidate.inputPendingClass);
            }

            for (const container of validatable.errorContainers) {
                container.classList.remove(wellidate.fieldPendingClass);
                container.classList.remove(wellidate.fieldErrorClass);
                container.classList.remove(wellidate.fieldValidClass);
                container.innerHTML = message || "";
            }

            validatable.element.dispatchEvent(new CustomEvent("wellidate-reset", {
                detail: { validatable },
                bubbles: true
            }));
        }
        pending(message) {
            const wellidate = this.wellidate;

            for (const element of this.elements) {
                element.classList.add(wellidate.inputPendingClass);
                element.classList.remove(wellidate.inputValidClass);
                element.classList.remove(wellidate.inputErrorClass);
            }

            for (const container of this.errorContainers) {
                container.classList.remove(wellidate.fieldErrorClass);
                container.classList.remove(wellidate.fieldValidClass);
                container.classList.add(wellidate.fieldPendingClass);
                container.innerHTML = message || "";
            }

            this.element.dispatchEvent(new CustomEvent("wellidate-pending", {
                detail: { validatable: this },
                bubbles: true
            }));
        }
        success(message) {
            const validatable = this;
            const wellidate = validatable.wellidate;

            validatable.element.setCustomValidity("");

            for (const element of validatable.elements) {
                element.classList.add(wellidate.inputValidClass);
                element.classList.remove(wellidate.inputErrorClass);
                element.classList.remove(wellidate.inputPendingClass);
            }

            for (const container of validatable.errorContainers) {
                container.classList.remove(wellidate.fieldPendingClass);
                container.classList.remove(wellidate.fieldErrorClass);
                container.classList.add(wellidate.fieldValidClass);
                container.innerHTML = message || "";
            }

            validatable.element.dispatchEvent(new CustomEvent("wellidate-success", {
                detail: { validatable },
                bubbles: true
            }));
        }
        error(method, message) {
            const validatable = this;
            const wellidate = validatable.wellidate;
            const rule = method ? validatable.rules[method] : null;
            const formattedMessage = message || rule.formatMessage();

            validatable.isDirty = true;
            validatable.element.setCustomValidity(formattedMessage);

            for (const element of validatable.elements) {
                element.classList.add(wellidate.inputErrorClass);
                element.classList.remove(wellidate.inputValidClass);
                element.classList.remove(wellidate.inputPendingClass);
            }

            for (const container of validatable.errorContainers) {
                container.classList.remove(wellidate.fieldPendingClass);
                container.classList.remove(wellidate.fieldValidClass);
                container.classList.add(wellidate.fieldErrorClass);
                container.innerHTML = formattedMessage;
            }

            validatable.element.dispatchEvent(new CustomEvent("wellidate-error", {
                detail: {
                    message: formattedMessage,
                    validatable: validatable,
                    method: method
                },
                bubbles: true
            }));
        }

        buildErrorContainers() {
            let name = this.element.name;

            if (name) {
                name = name.replace(/(["\]\\])/g, "\\$1");

                this.errorContainers = Array.from(document.querySelectorAll(`[data-valmsg-for="${name}"]`));
            } else {
                this.errorContainers = [];
            }
        }
        buildInputRules() {
            const validatable = this;
            const rules = validatable.rules;
            const element = validatable.element;
            const defaultRule = Wellidate.default.rule;
            const defaultRules = Wellidate.default.rules;

            if (element.required && defaultRules.required) {
                rules.required = Object.assign({}, defaultRule, defaultRules.required, { element });
            }

            if (element.type == "email" && defaultRules.email) {
                rules.email = Object.assign({}, defaultRule, defaultRules.email, { element });
            }

            if (element.accept && defaultRules.accept) {
                rules.accept = Object.assign({}, defaultRule, defaultRules.accept, {
                    types: element.accept,
                    element: element
                });
            }

            if (element.getAttribute("minlength") && defaultRules.minlength) {
                rules.minlength = Object.assign({}, defaultRule, defaultRules.minlength, {
                    min: element.getAttribute("minlength"),
                    element: element
                });
            }

            if (element.getAttribute("maxlength") && defaultRules.maxlength) {
                rules.maxlength = Object.assign({}, defaultRule, defaultRules.maxlength, {
                    max: element.getAttribute("maxlength"),
                    element: element
                });
            }

            if (element.min && defaultRules.min) {
                rules.min = Object.assign({}, defaultRule, defaultRules.min, {
                    value: element.min,
                    element: element
                });
            }

            if (element.max && defaultRules.max) {
                rules.max = Object.assign({}, defaultRule, defaultRules.max, {
                    value: element.max,
                    element: element
                });
            }

            if (element.step && defaultRules.step) {
                rules.step = Object.assign({}, defaultRule, defaultRules.step, {
                    value: element.step,
                    element: element
                });
            }

            if (element.pattern && defaultRules.regex) {
                rules.regex = Object.assign({}, defaultRule, defaultRules.regex, {
                    pattern: element.pattern,
                    title: element.title,
                    element: element
                });
            }
        }
        buildDataRules() {
            const element = this.element;
            const defaultRule = Wellidate.default.rule;
            const attributes = Array.from(element.attributes).filter(attribute => /^data-val-\w+$/.test(attribute.name));

            for (const attribute of attributes) {
                const prefix = attribute.name;
                const method = prefix.substring(9);
                const rule = this.rules[method] || Wellidate.default.rules[method];

                if (rule) {
                    const dataRule = {
                        message: attribute.value || rule.message,
                        isDataMessage: Boolean(attribute.value)
                    };

                    for (const parameter of Array.from(element.attributes)) {
                        if (parameter.name.startsWith(`${prefix}-`)) {
                            dataRule[parameter.name.substring(prefix.length + 1)] = parameter.value;
                        }
                    }

                    this.rules[method] = Object.assign({}, defaultRule, rule, dataRule, { element });
                }
            }
        }
        build() {
            this.buildErrorContainers();
            this.buildInputRules();
            this.buildDataRules();
        }

        bind() {
            const validatable = this;
            const wellidate = this.wellidate;
            const input = validatable.element;
            const event = input.tagName == "SELECT" || input.type == "hidden" ? "change" : "input";

            for (const element of validatable.elements) {
                element.addEventListener(event, () => {
                    if (element.type == "hidden" || validatable.isDirty) {
                        validatable.validate();
                    }
                });

                element.addEventListener("focus", function () {
                    if (wellidate.focusCleanup) {
                        validatable.reset();
                    }

                    wellidate.lastActive = this;
                });

                element.addEventListener("blur", function () {
                    if (validatable.isDirty || this.value.length) {
                        validatable.isDirty = !validatable.validate();
                    }
                });
            }
        }
    }

    class Wellidate {
        constructor(container, options = {}) {
            const wellidate = this;

            if (container.dataset.valId) {
                return Wellidate.instances[parseInt(container.dataset.valId)].set(options);
            }

            wellidate.wasValidatedClass = Wellidate.default.classes.wasValidated;
            wellidate.inputPendingClass = Wellidate.default.classes.inputPending;
            wellidate.fieldPendingClass = Wellidate.default.classes.fieldPending;
            wellidate.inputErrorClass = Wellidate.default.classes.inputError;
            wellidate.inputValidClass = Wellidate.default.classes.inputValid;
            wellidate.fieldErrorClass = Wellidate.default.classes.fieldError;
            wellidate.fieldValidClass = Wellidate.default.classes.fieldValid;
            container.dataset.valId = Wellidate.instances.length.toString();
            wellidate.summary = wellidate.extend(Wellidate.default.summary);
            wellidate.focusCleanup = Wellidate.default.focusCleanup;
            wellidate.focusInvalid = Wellidate.default.focusInvalid;
            wellidate.excludes = Wellidate.default.excludes.slice();
            wellidate.include = Wellidate.default.include;
            wellidate.container = container;
            wellidate.validatables = [];

            if (container.tagName == "FORM") {
                container.noValidate = true;
            }

            wellidate.set(options);
            wellidate.bind();

            Wellidate.instances.push(wellidate);
        }

        set(options) {
            const wellidate = this;

            wellidate.setOption("include", options.include);
            wellidate.setOption("summary", options.summary);
            wellidate.setOption("excludes", options.excludes);
            wellidate.setOption("focusCleanup", options.focusCleanup);
            wellidate.setOption("focusInvalid", options.focusInvalid);
            wellidate.setOption("fieldValidClass", options.fieldValidClass);
            wellidate.setOption("fieldErrorClass", options.fieldErrorClass);
            wellidate.setOption("inputValidClass", options.inputValidClass);
            wellidate.setOption("inputErrorClass", options.inputErrorClass);
            wellidate.setOption("fieldPendingClass", options.fieldPendingClass);
            wellidate.setOption("inputPendingClass", options.inputPendingClass);
            wellidate.setOption("wasValidatedClass", options.wasValidatedClass);

            wellidate.rebuild();

            for (const selector of Object.keys(options.rules || {})) {
                for (const validatable of wellidate.filterValidatables(selector)) {
                    const element = validatable.element;

                    for (const method of Object.keys(options.rules[selector])) {
                        const defaultRule = Wellidate.default.rule;
                        const newRule = options.rules[selector][method];
                        const methodRule = validatable.rules[method] || Wellidate.default.rules[method] || {};

                        validatable.rules[method] = wellidate.extend(defaultRule, methodRule, newRule, { element });
                    }
                }
            }

            return wellidate;
        }

        rebuild() {
            const wellidate = this;

            wellidate.validatables = [];

            if (wellidate.container.matches(wellidate.include)) {
                const group = wellidate.buildGroupElements(wellidate.container);

                wellidate.validatables.push(new WellidateValidatable(wellidate, group));
            } else {
                for (const element of wellidate.container.querySelectorAll(wellidate.include)) {
                    const group = wellidate.buildGroupElements(element);

                    if (element == group[0]) {
                        wellidate.validatables.push(new WellidateValidatable(wellidate, group));
                    }
                }
            }
        }
        form(...filter) {
            const wellidate = this;
            const result = wellidate.validate(...filter);

            for (const valid of result.valid) {
                valid.validatable.success();
            }

            for (const invalid of result.invalid) {
                invalid.validatable.error(invalid.method);
            }

            wellidate.summary.show(result);

            if (wellidate.focusInvalid) {
                wellidate.focus(result.invalid.map(invalid => invalid.validatable));
            }

            wellidate.container.classList.add(wellidate.wasValidatedClass);

            return !result.invalid.length;
        }
        isValid(...filter) {
            for (const validatable of this.filterValidatables(...filter)) {
                for (const method of Object.keys(validatable.rules)) {
                    const rule = validatable.rules[method];

                    if (rule.isEnabled() && !rule.isValid(validatable)) {
                        validatable.isValid = false;

                        return false;
                    }
                }

                validatable.isValid = true;
            }

            return true;
        }
        apply(results) {
            for (const selector of Object.keys(results)) {
                for (const validatable of this.filterValidatables(selector)) {
                    const result = results[selector];

                    if (typeof result.error != "undefined") {
                        validatable.error(null, result.error);
                    } else if (typeof result.success != "undefined") {
                        validatable.success(result.success);
                    } else if (typeof result.reset != "undefined") {
                        validatable.reset(result.reset);
                    }
                }
            }
        }
        validate(...filter) {
            const valid = [];
            const invalid = [];

            for (const validatable of this.filterValidatables(...filter)) {
                validatable.isValid = true;

                for (const method of Object.keys(validatable.rules)) {
                    const rule = validatable.rules[method];

                    if (rule.isEnabled() && !rule.isValid(validatable)) {
                        invalid.push({
                            message: rule.formatMessage(),
                            validatable: validatable,
                            method: method
                        });

                        validatable.isValid = false;

                        break;
                    }
                }

                if (validatable.isValid) {
                    valid.push({ validatable });
                }
            }

            return {
                isValid: !invalid.length,
                invalid: invalid,
                valid: valid
            };
        }

        reset() {
            const wellidate = this;

            wellidate.summary.reset();

            wellidate.container.classList.remove(wellidate.wasValidatedClass);

            for (const validatable of wellidate.validatables) {
                validatable.reset();
            }
        }

        extend(...args) {
            const options = {};

            for (const arg of args) {
                for (const key of Object.keys(arg)) {
                    if (Object.prototype.toString.call(options[key]) == "[object Object]") {
                        options[key] = this.extend(options[key], arg[key]);
                    } else {
                        options[key] = arg[key];
                    }
                }
            }

            return options;
        }
        setOption(option, value) {
            const wellidate = this;

            if (typeof value != "undefined") {
                if (Object.prototype.toString.call(value) == "[object Object]") {
                    wellidate[option] = wellidate.extend(wellidate[option], value);
                } else {
                    wellidate[option] = value;
                }
            }
        }

        buildGroupElements(group) {
            if (group.name) {
                const name = group.name.replace(/(["\]\\])/g, "\\$1");

                return Array.from(document.querySelectorAll(`[name="${name}"]`));
            }

            return [group];
        }

        focus(errors) {
            if (errors.length) {
                let invalid = errors[0];

                for (let i = 1; i < errors.length; i++) {
                    if (this.lastActive == errors[i].element) {
                        invalid = errors[i];

                        break;
                    } else if (invalid.element.compareDocumentPosition(errors[i].element) == 2) {
                        invalid = errors[i];
                    }
                }

                this.lastActive = invalid.element;

                if (this.focusCleanup) {
                    invalid.reset();
                }

                invalid.element.focus();
            }
        }
        isExcluded(element) {
            for (const exclude of this.excludes) {
                if (element.matches(exclude)) {
                    return true;
                }
            }

            return false;
        }
        filterValidatables(...filter) {
            return this.validatables.filter(validatable => {
                for (const filterId of filter) {
                    if (validatable.element.matches(filterId)) {
                        return true;
                    }
                }

                return !filter.length;
            }).filter(validatable => !this.isExcluded(validatable.element));
        }

        bind() {
            const wellidate = this;

            if (wellidate.container.tagName == "FORM") {
                wellidate.container.addEventListener("submit", function (e) {
                    if (wellidate.form()) {
                        this.dispatchEvent(new CustomEvent("wellidate-valid", {
                            detail: { wellidate },
                            bubbles: true
                        }));

                        if (wellidate.submitHandler) {
                            e.preventDefault();

                            wellidate.submitHandler();
                        }
                    } else {
                        e.preventDefault();

                        this.dispatchEvent(new CustomEvent("wellidate-invalid", {
                            detail: { wellidate },
                            bubbles: true
                        }));
                    }
                });

                wellidate.container.addEventListener("reset", () => {
                    wellidate.reset();
                });
            }
        }
    }

    Wellidate.default = {
        focusInvalid: true,
        focusCleanup: false,
        include: "input,textarea,select",
        summary: {
            container: "[data-valmsg-summary=true]",
            show(result) {
                if (this.container) {
                    const summary = document.querySelector(this.container);

                    if (summary) {
                        summary.innerHTML = "";

                        if (result.isValid) {
                            summary.classList.add("validation-summary-valid");
                            summary.classList.remove("validation-summary-errors");
                        } else {
                            summary.classList.add("validation-summary-errors");
                            summary.classList.remove("validation-summary-valid");

                            const list = document.createElement("ul");

                            for (const invalid of result.invalid) {
                                const item = document.createElement("li");

                                item.innerHTML = invalid.message;

                                list.appendChild(item);
                            }

                            summary.appendChild(list);
                        }
                    }
                }
            },
            reset() {
                this.show({
                    isValid: true,
                    invalid: [],
                    valid: []
                });
            }
        },
        classes: {
            inputPending: "input-validation-pending",
            inputError: "input-validation-error",
            inputValid: "input-validation-valid",
            fieldPending: "input-validation-pending",
            fieldError: "field-validation-error",
            fieldValid: "field-validation-valid",
            wasValidated: "was-validated"
        },
        excludes: [
            "input[type=button]",
            "input[type=submit]",
            "input[type=image]",
            "input[type=reset]",
            ":disabled"
        ],
        rule: {
            trim: true,
            message: "This field is not valid.",
            isValid() {
                return false;
            },
            isEnabled() {
                return true;
            },
            formatMessage() {
                return this.message;
            },
            normalizeValue(element) {
                const input = element || this.element;
                let value = input.value;

                if (input.tagName == "SELECT" && input.multiple) {
                    return Array.from(input.options).filter(option => option.selected).length.toString();
                } else if (input.type == "radio") {
                    if (input.name) {
                        const name = input.name.replace(/(["\]\\])/g, "\\$1");
                        const checked = document.querySelector(`input[name="${name}"]:checked`);

                        value = checked ? checked.value : "";
                    } else {
                        value = input.checked ? value : "";
                    }
                } else if (input.type == "file") {
                    if (value.lastIndexOf("\\") >= 0) {
                        value = value.substring(value.lastIndexOf("\\") + 1);
                    } else if (value.lastIndexOf("/") >= 0) {
                        value = value.substring(value.lastIndexOf("/") + 1);
                    }
                }

                return this.trim ? value.trim() : value;
            }
        },
        rules: {
            required: {
                message: "This field is required.",
                isValid() {
                    return Boolean(this.normalizeValue());
                }
            },
            equalto: {
                message: "Please enter the same value again.",
                isValid() {
                    const other = document.getElementById(this.other);

                    return other != null && this.normalizeValue() == this.normalizeValue(other);
                }
            },
            length: {
                message: "Please enter a value between {0} and {1} characters long.",
                isValid() {
                    const length = this;
                    const value = length.normalizeValue();

                    return (length.min == null || length.min <= value.length) && (value.length <= length.max || length.max == null);
                },
                formatMessage() {
                    const length = this;

                    if (length.min != null && length.max == null && !length.isDataMessage) {
                        return Wellidate.default.rules.minlength.message.replace("{0}", length.min);
                    } else if (length.min == null && length.max != null && !length.isDataMessage) {
                        return Wellidate.default.rules.maxlength.message.replace("{0}", length.max);
                    }

                    return length.message.replace("{0}", length.min).replace("{1}", length.max);
                }
            },
            minlength: {
                message: "Please enter at least {0} characters.",
                isValid() {
                    return this.min <= this.normalizeValue().length;
                },
                formatMessage() {
                    return this.message.replace("{0}", this.min);
                }
            },
            maxlength: {
                message: "Please enter no more than {0} characters.",
                isValid() {
                    return this.normalizeValue().length <= this.max;
                },
                formatMessage() {
                    return this.message.replace("{0}", this.max);
                }
            },
            email: {
                message: "Please enter a valid email address.",
                isValid() {
                    return /^$|^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(this.normalizeValue());
                }
            },
            integer: {
                message: "Please enter a valid integer value.",
                isValid() {
                    return /^$|^[+-]?\d+$/.test(this.normalizeValue());
                }
            },
            number: {
                message: "Please enter a valid number.",
                scaleMessage: "Please enter a value with no more than {0} fractional digits",
                precisionMessage: "Please enter a value using no more than {0} significant digits",
                isValid() {
                    const number = this;
                    const scale = parseInt(number.scale);
                    const value = number.normalizeValue();
                    const precision = parseInt(number.precision);
                    let isValid = /^$|^[+-]?(\d+|\d{1,3}(,\d{3})+)?(\.\d+)?$/.test(value);

                    if (isValid && value && precision > 0) {
                        number.isValidPrecision = number.digits(value.split(".")[0].replace(/^[-+,0]+/, "")) <= precision - (scale || 0);
                        isValid = number.isValidPrecision;
                    } else {
                        number.isValidPrecision = true;
                    }

                    if (isValid && value.indexOf(".") >= 0 && scale >= 0) {
                        number.isValidScale = number.digits(value.split(".")[1].replace(/0+$/, "")) <= scale;
                        isValid = number.isValidScale;
                    } else {
                        number.isValidScale = true;
                    }

                    return isValid;
                },
                digits(value) {
                    return value.split("").filter(e => !isNaN(parseInt(e))).length;
                },
                formatMessage() {
                    const number = this;

                    if (number.isValidPrecision === false && !number.isDataMessage) {
                        return number.precisionMessage.replace("{0}", parseInt(number.precision) - (parseInt(number.scale) || 0));
                    } else if (number.isValidScale === false && !number.isDataMessage) {
                        return number.scaleMessage.replace("{0}", parseInt(number.scale) || 0);
                    }

                    return number.message;
                }
            },
            digits: {
                message: "Please enter only digits.",
                isValid() {
                    return /^\d*$/.test(this.normalizeValue());
                }
            },
            date: {
                message: "Please enter a valid date.",
                isValid() {
                    return /^$|^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(this.normalizeValue());
                }
            },
            range: {
                message: "Please enter a value between {0} and {1}.",
                isValid() {
                    const min = parseFloat(this.min);
                    const max = parseFloat(this.max);
                    const value = this.normalizeValue();

                    return !value || (min == null || min <= value) && (value <= max || max == null);
                },
                formatMessage() {
                    const range = this;

                    if (range.min != null && range.max == null && !range.isDataMessage) {
                        return Wellidate.default.rules.min.message.replace("{0}", range.min);
                    } else if (range.min == null && range.max != null && !range.isDataMessage) {
                        return Wellidate.default.rules.max.message.replace("{0}", range.max);
                    }

                    return range.message.replace("{0}", range.min).replace("{1}", range.max);
                }
            },
            min: {
                message: "Please enter a value greater than or equal to {0}.",
                isValid() {
                    const value = this.normalizeValue();

                    return !value || parseFloat(this.value) <= value;
                },
                formatMessage() {
                    return this.message.replace("{0}", this.value);
                }
            },
            max: {
                message: "Please enter a value less than or equal to {0}.",
                isValid() {
                    const value = this.normalizeValue();

                    return !value || value <= parseFloat(this.value);
                },
                formatMessage() {
                    return this.message.replace("{0}", this.value);
                }
            },
            greater: {
                message: "Please enter a value greater than {0}.",
                isValid() {
                    const value = this.normalizeValue();

                    return !value || parseFloat(this.than) < value;
                },
                formatMessage() {
                    return this.message.replace("{0}", this.than);
                }
            },
            lower: {
                message: "Please enter a value lower than {0}.",
                isValid() {
                    const value = this.normalizeValue();

                    return !value || value < parseFloat(this.than);
                },
                formatMessage() {
                    return this.message.replace("{0}", this.than);
                }
            },
            step: {
                message: "Please enter a multiple of {0}.",
                isValid() {
                    const value = this.normalizeValue();

                    return !value || value % parseInt(this.value) == 0;
                },
                formatMessage() {
                    return this.message.replace("{0}", this.value);
                }
            },
            filesize: {
                page: 1024,
                message: "File size should not exceed {0} MB.",
                isValid() {
                    const size = Array.from(this.element.files).reduce((total, file) => total + file.size, 0);

                    return size <= this.max || this.max == null;
                },
                formatMessage() {
                    const filesize = this;
                    const mb = (filesize.max / filesize.page / filesize.page).toFixed(2);

                    return filesize.message.replace("{0}", mb.replace(/[.|0]*$/, ""));
                }
            },
            accept: {
                message: "Please select files in correct format.",
                isValid() {
                    const filter = this.types.split(",").map(type => type.trim());

                    const correct = Array.from(this.element.files).filter(file => {
                        const extension = file.name.split(".").pop();

                        for (const type of filter) {
                            if (type.startsWith(".")) {
                                if (file.name != extension && `.${extension}` == type) {
                                    return true;
                                }
                            } else if (type.endsWith("/*")) {
                                if (file.type.startsWith(type.replace(/\*$/, ""))) {
                                    return true;
                                }
                            } else if (file.type == type) {
                                return true;
                            }
                        }

                        return !filter.length;
                    });

                    return this.element.files.length == correct.length;
                }
            },
            regex: {
                message: "Please enter value in a valid format. {0}",
                isValid() {
                    const value = this.normalizeValue();

                    return !value || !this.pattern || new RegExp(this.pattern).test(value);
                },
                formatMessage() {
                    return this.message.replace("{0}", this.title || "");
                }
            },
            remote: {
                type: "get",
                message: "Please fix this field.",
                isValid(validatable) {
                    const remote = this;

                    if (remote.controller) {
                        remote.controller.abort();
                    }

                    clearTimeout(remote.start);
                    remote.start = setTimeout(() => {
                        if (validatable.isValid) {
                            remote.controller = new AbortController();

                            fetch(remote.buildUrl(), {
                                method: remote.type,
                                headers: { "X-Requested-With": "XMLHttpRequest" }
                            }).then(response => {
                                if (validatable.isValid && response.ok) {
                                    return response.text();
                                }

                                return "";
                            }).then(response => {
                                if (response) {
                                    remote.apply(validatable, response);
                                }
                            });

                            remote.prepare(validatable);

                            validatable.pending();
                        }
                    }, 1);

                    return true;
                },
                buildUrl() {
                    const remote = this;
                    const url = new URL(remote.url, location.href);
                    const fields = (remote.additionalFields || "").split(",").filter(Boolean);

                    for (const field of fields) {
                        const element = document.querySelector(field);

                        url.searchParams.append(element.name, remote.normalizeValue(element) || "");
                    }

                    url.searchParams.append(remote.element.name, remote.normalizeValue() || "");

                    return url.href;
                },
                prepare() {
                },
                apply(validatable, response) {
                    const result = JSON.parse(response);

                    if (result.isValid === false) {
                        validatable.error("remote", result.message);
                    } else {
                        validatable.success(result.message);
                    }
                }
            }
        }
    };
    Wellidate.instances = [];

    exports.Wellidate = Wellidate;
    exports.WellidateValidatable = WellidateValidatable;
}));
