var dialog;
$(function () {

    var Dialog = Class({
        'constructor': function (args) {
            this._super.constructor.call(this, args);
        },
        'imgPath': './close.png'
    }, $.floatingWindow);

    var phase = 0;
    var processing = false;

    var LHS = [];
    var RHS = [];
    var ZERO = {
        'sign': 1,
        'absolute': 0,
        'variable': {}
    };
    var text_c, text_2ax, text_b, text_rb2m4ac, text_4a, text_b2;

    var render_left, render_top, render_x, render_y, letter_space = 4;
    var speed = 1000;

    initialize();

    function initialize() {

        reset();

        $('#inp').on({
            'textchange': function () {
                reset();
            },
            'keypress': function (e) {
                switch (e.keyCode) {
                    case 13:
                        if ($('#parse').prop('disabled') === false) parse();
                        break;
                }
            }
        });
        $('#parse').on({
            'click': parse
        });
        $('.action').on({
            'click': function () {
                execute(this.id.substr(6));
            }
        });
        $('#speed').on({
            'change': function () {
                speed = (10 ** ((2000 - parseInt(this.value)) / 1000) - 1) * 100;
            }
        });
    }

    function reset() {
        disableButtons(true);
        $('#parse').prop('disabled', false);

        phase = 0;
        $('#speed').trigger('change');

        var offset = $('#render').offset();
        render_x = render_left = offset.left + 16;
        render_y = render_top = offset.top + 60;
        $('#render').empty();
    }

    function disableButtons(disable) {
        $('#parse, .action').prop({
            'disabled': disable
        });
    }

    function parse() {
        reset();
        disableButtons(true);

        render({
            'id': 'Pmsg',
            'expr': '$\\mathcal{Loading...}$',
            'during': speed,
            'css': {
                'color': '#070'
            }
        });

        // equal check
        var val = $('#inp').val().split('=');
        if (val.length !== 2) {
            return error(0);
        }
        var lhsString = val[0].trim();
        var rhsString = val[1].trim();
        switch (0) {
            case lhsString.length:
            case rhsString.length:
                return error(0);
        }
        switch (true) {
            case (LHS = parse_quadratic(lhsString)) === false:
            case (RHS = parse_quadratic(rhsString)) === false:
            case LHS[2].absolute === 0:
            case add_term(LHS[0], RHS[0]) === false:
            case RHS[1].absolute !== 0:
            case RHS[2].absolute !== 0:
                return error(0);
        }

        execute(0);
    }

    function parse_quadratic(arg) {
        arg = arg.trim();

        var a = ZERO,
            b = ZERO,
            c = ZERO;

        // detect 'a7 (x^2 term)
        var tmp = arg.split('x^2');
        switch (tmp.length) {
            case 1: // not exists
                break;
            case 2: // found
                if ((a = parse_term(tmp.shift() + 'x^2')) !== false) break;
            default: // too many
                return false;
        }

        // detect 'b' (x term)
        tmp = tmp[0].split('x');
        switch (tmp.length) {
            case 1: // not exsists
                break;
            case 2: // found
                if ((b = parse_term(tmp.shift() + 'x')) !== false) break;
            default: // too many
                return false;
        }

        // detect constant term
        if (tmp[0] !== '') {
            if ((c = parse_term(tmp[0])) === false) return false;
        }

        return [c, b, a];
    }

    function parse_term(arg, limitAbsolute = true) {
        arg = arg.trim();
        if (arg === '') return false;

        var sign = 1,
            absolute, variable = {};
        switch (arg.substr(0, 1)) {
            case '-':
                sign = -1;
            case '+':
                arg = arg.substr(1).trim();
                if (arg === '') {
                    return {
                        'sign': 1,
                        'absolute': 1,
                        'variable': {}
                    };
                }
        }

        absolute = arg.match(/^[0-9]*[0-9]?/) + '';
        switch (true) {
            case absolute === '':
                absolute = 1;
                break;

            case limitAbsolute && (absolute.length > 3):
                return false;

            case absolute === arg:
                return {
                    'sign': sign,
                    'absolute': parseInt(absolute),
                    'variable': {}
                };

            default:
                arg = arg.substr(absolute.length);
                absolute = parseInt(absolute);
        }

        var c, len = arg.length;
        for (var i = 0; i < len; i++) {
            c = arg.substr(i, 1);
            switch (true) {
                case c === ' ':
                    continue;
                case /[a-zA-Z]/.test(c):
                    var index = 1;
                    if (i + 2 < len &&
                        /^\^[0-9]+/.test(arg.substr(i + 1))) {
                        index = arg.substr(i + 2).match(/[0-9]+/);
                        i += 1 + index.length;
                        index = parseInt(index);
                    }
                    if (variable[c]) {
                        variable[c] += index;
                    } else {
                        variable[c] = index;
                    }
                    break;
                default:
                    return false;
            }
        }

        if (absolute) {
            return {
                'sign': sign,
                'absolute': absolute,
                'variable': variable
            };
        } else {
            return ZERO;
        }
    }

    function convertToText(arg, forceSign) {

        // get a string of the variables
        var vars = get_variables(arg);

        var c, variable = '';
        for (var i = 0; i < vars.length; i++) {
            c = vars.substr(i, 1);
            variable += c;
            if (arg.variable[c] != 1) {
                variable += '^' + arg.variable[c];
            }
        }
        return (arg.sign < 0 && (variable || arg.absolute) ? '-' : (forceSign === true ? '+' : '')) +
            (variable && arg.absolute === 1 ? '' : arg.absolute) + variable;
    }
    // get a string of the variables
    function get_variables(arg) {
        var vars = '';
        // all variables
        $.each(arg.variable, function (v) {
            vars += v;
        });
        return sort(vars);

        function sort(s) {
            s = s.split('');
            s.sort(function (a, b) {
                a = a.charCodeAt(0);
                b = b.charCodeAt(0);
                if (a >= 97 && a !== 120) a -= 64;
                if (b >= 97 && b !== 120) b -= 64;
                return (a < b ? -1 : 1);
            });
            return s.join('');
        }
    }

    function clone_term(arg) {
        return {
            'sign': arg.sign,
            'absolute': arg.absolute,
            'variable': Object.assign({}, arg.variable)
        }
    }

    function add_term(arg1, arg2) {
        switch (0) {
            case arg1.absolute:
                return clone_term(arg2);
            case arg2.absolute:
                return clone_term(arg1);
        }
        if (get_variables(arg1) === get_variables(arg2)) {
            $.each(arg1, function (v) {
                if (arg1[v] !== arg2[v]) {
                    return false;
                }
            });
            var ret = clone_term(arg1);
            var number = ret.sign * ret.absolute + arg2.sign * arg2.absolute;
            if (number === 0) return ZERO;
            ret.sign = (number < 0 ? -1 : 1);
            ret.absolute = Math.abs(number);
            return ret;
        } else {
            return false;
        }
    }

    function sub_term(arg1, arg2) {
        switch (0) {
            case arg1.absolute:
                ret = clone_term(arg2);
                ret.sign *= -1;
                return ret;
            case arg2.absolute:
                return clone_term(arg1);
        }
        if (get_variables(arg1) === get_variables(arg2)) {
            $.each(arg1, function (v) {
                if (arg1[v] !== arg2[v]) {
                    return false;
                }
            });
            var ret = clone_term(arg1);
            var number = ret.sign * ret.absolute - arg2.sign * arg2.absolute;
            if (number === 0) return ZERO;
            ret.sign = (number < 0 ? -1 : 1);
            ret.absolute = Math.abs(number);
            return ret;
        } else {
            return false;
        }
    }

    function mul_term(arg1, arg2) {
        var ret = {
            'sign': arg1.sign * arg2.sign,
            'absolute': arg1.absolute * arg2.absolute,
            'variable': Object.assign({}, arg1.variable)
        };
        if (ret.absolute === 0) return ZERO;
        $.each(arg2.variable, function (v) {
            if (ret.variable[v] === undefined) {
                ret.variable[v] = this;
            } else {
                ret.variable[v] += this;
            }
        });
        return ret;
    }

    function error(errno) {

        dialog = new Dialog();
        dialog.setTitle('Oops!!');
        dialog.setScreen('<div><div id="msg"></div></div>');

        switch (errno) {
            case 0:
                reset();
                $('#msg').html('Parse Error.');
                break;
            default:
                $('#msg').html('Invalid Operation.');
        }
        dialog.showDialog(250).centering();
    }

    function render(arg) {

        var id = arg.id;

        // create new DOM if the id is not existed
        if ($('#' + id).length === 0) {
            $('#render').append('<div id="' + id + '" class="render"></div>');
        }

        // update latex commands (hide while rendering)
        var $target = $('#' + id).css('visibility', 'hidden').html(arg.expr);
        var offset = $target.offset();

        // add queue for rendering
        MathJax.Hub.Queue(

            // render
            ['Typeset', MathJax.Hub, id],

            // callback
            [function () {
                var left;
                $target.css({
                    'left': left = (arg.x ? arg.x : render_x) + (arg.offset_x ? arg.offset_x : 0),
                    'top': (arg.y ? arg.y : render_y) + (arg.offset_y ? arg.offset_y : 0) - $target.height()
                }).show();
                $target.attr({
                    'w': $target.width(),
                    'h': $target.height()
                });
                render_x = left + $target.width() + letter_space;
                $target.hide().css('visibility', 'visible');
                if (arg.css !== undefined) $target.css(arg.css);
                switch (false) {
                    case isFinite(arg.during):
                        arg.during = 0;
                    case arg.during !== 0:
                        $target.show();
                    case arg.during >= 0:
                        if (arg.callback) arg.callback();
                        break;
                    default:
                        $target.show(arg.during, function () {
                            if (arg.callback) arg.callback();
                        });
                }
            }]
        );
    }

    function execute(action) {
        action = parseInt(action);

        var $target;
        switch (phase) {

            case 0: // ready
                if (phase !== 0) return;
                startPhase();

                (function () {
                    // calculate all terms for quadratic equation
                    var term_a = clone_term(LHS[2]);
                    delete term_a.variable.x;
                    var term_b = clone_term(LHS[1]);
                    delete term_b.variable.x;
                    var term_mb = clone_term(term_b);
                    term_mb.sign *= -1;
                    var term_b2 = mul_term(term_b, term_b);

                    var term_2a = clone_term(term_a);
                    var term_4a = clone_term(term_a);
                    term_2a.absolute *= 2;
                    term_4a.absolute *= 4;
                    var term_2abx = mul_term(term_2a, LHS[1]);
                    var term_4abx = mul_term(term_4a, LHS[1]);

                    var term_2ax = clone_term(LHS[2]);
                    term_2ax.absolute *= 2;
                    term_2ax.variable.x = 1;
                    var term_4a2x2 = mul_term(term_2ax, term_2ax);

                    // convert useful terms to latex commands
                    text_c = convertToText(LHS[0]);
                    var latex_2a = convertToText(term_2a);
                    var latex_4a = '$' + (text_4a = convertToText(term_4a)) + '$';
                    var latex_2ax = '$' + (text_2ax = convertToText(term_2ax)) + '$';
                    var latex_2abx = '$' + convertToText(term_2abx, true) + '$';
                    var latex_b = '$' + (text_b = convertToText(term_b, true)) + '$';
                    var latex_mb = convertToText(term_mb);
                    var latex_b2 = (text_b2 = convertToText(term_b2));
                    var latex_pb2 = '$' + convertToText(term_b2, true) + '$';
                    var latex_b2m4ac, latex_rb2m4ac, latex_mbrb2m4ac, latex_kai;

                    var term_m4ac = mul_term(term_4a, sub_term(RHS[0], LHS[0]));
                    var term_b2m4ac = add_term(term_b2, term_m4ac);

                    switch (true) {
                        case term_b2m4ac === false:
                            latex_b2m4ac = latex_b2 + convertToText(term_m4ac, true);
                            latex_rb2m4ac = '\\pm\\sqrt{' + latex_b2m4ac + '}';
                            if (LHS[1].absolute) {
                                latex_mbrb2m4ac = latex_mb + latex_rb2m4ac;
                                latex_kai = '$$\\frac{' + latex_mbrb2m4ac + '}{' + latex_2a + '}$$';
                            } else {
                                latex_mbrb2m4ac = latex_mb;
                                latex_kai = '$$\\frac{' + latex_mbrb2mrac + '}{' + latex_2a + '}$$';
                            }
                            break;
                        case term_b2m4ac.absolute !== 0:
                            latex_b2m4ac = convertToText(term_b2m4ac);
                            latex_rb2m4ac = '\\pm\\sqrt{' + latex_b2m4ac + '}';
                            if (LHS[1].absolute) {
                                latex_mbrb2m4ac = latex_mb + latex_rb2m4ac;
                                latex_kai = '$$\\frac{' + latex_mbrb2m4ac + '}{' + latex_2a + '}$$';
                            } else {
                                latex_mbrb2m4ac = latex_rb2m4ac;
                                latex_kai = '$$\\frac{' + latex_mbrb2m4ac + '}{' + latex_2a + '}$$';
                            }
                            break;
                        default:
                            latex_b2m4ac = '0';
                            latex_rb2m4ac = '0';
                            if (LHS[1].absolute) {
                                latex_mbrb2m4ac = latex_mb;
                                latex_kai = '$$\\frac{' + latex_mb + '}{' + latex_2a + '}$$';
                            } else {
                                latex_mbrb2m4ac = '0';
                                latex_kai = '0';
                            }
                            break;
                    }
                    text_rb2m4ac = 'ﾂｱ竏�' + latex_b2m4ac;

                    // render the terms
                    render({ // '4a'
                        'id': 'P201',
                        'expr': latex_4a,
                        'x': render_left
                    });
                    if (LHS[1].absolute) {
                        render({ // '4a'
                            'id': 'P202',
                            'expr': latex_4a,
                            'x': render_left
                        });
                    }
                    render({ // '('
                        'id': 'P203',
                        'expr': '$($'
                    });
                    render({ // ')'
                        'id': 'P204',
                        'expr': '$)$'
                    });
                    render({ // '4a'
                        'id': 'P205',
                        'expr': latex_4a
                    });
                    render({ // '('
                        'id': 'P206',
                        'expr': '$($'
                    });
                    render({ // ')'
                        'id': 'P207',
                        'expr': '$)$'
                    });
                    render({ // '4a^2x^2'
                        'id': 'P301',
                        'expr': '$' + convertToText(term_4a2x2) + '$',
                        'x': render_left
                    });
                    render({ // '+4abx'
                        'id': 'P302',
                        'expr': '$' + convertToText(term_4abx, true) + '$'
                    });
                    render({ // '-4ac'
                        'id': 'P303',
                        'expr': '$' + convertToText(term_m4ac) + '$'
                    });
                    render({ // '+b^2'
                        'id': 'P401',
                        'expr': latex_pb2,
                        'x': render_left
                    });
                    render({ // '+b^2'
                        'id': 'P402',
                        'expr': latex_pb2
                    });
                    render({ // 'b^2-4ac'
                        'id': 'P403',
                        'expr': '$' + latex_b2m4ac + '$'
                    });
                    render({ // '+2abx'
                        'id': 'P501',
                        'expr': latex_2abx,
                        'x': render_left
                    });
                    render({ // '+2abx'
                        'id': 'P502',
                        'expr': latex_2abx
                    });
                    render({ // '2ax'
                        'id': 'P511',
                        'expr': latex_2ax,
                        'x': render_left
                    });
                    render({ // '2ax'
                        'id': 'P512',
                        'expr': latex_2ax
                    });
                    render({ // '+b'
                        'id': 'P513',
                        'expr': latex_b
                    });
                    render({ // '+b'
                        'id': 'P514',
                        'expr': latex_b
                    });
                    render({ // '2a'
                        'id': 'P515',
                        'expr': '$' + latex_2a + '$',
                        'x': render_left
                    });
                    render({ // 'x'
                        'id': 'P516',
                        'expr': '$x$'
                    });
                    render({ // '+b'
                        'id': 'P517',
                        'expr': latex_b
                    });
                    render({ // '+2ax'
                        'id': 'P518',
                        'expr': '$' + convertToText(term_2ax, true) + '$'
                    });
                    render({ // '+b'
                        'id': 'P519',
                        'expr': latex_b
                    });
                    render({ // ')^2'
                        'id': 'P521',
                        'expr': '$)^2$'
                    });
                    render({ // 'ﾂｱ竏喘^2-4ac'
                        'id': 'P601',
                        'expr': '$' + latex_rb2m4ac + '$'
                    });
                    render({ // '-b'
                        'id': 'P701',
                        'expr': '$' + latex_mb + '$',
                        'x': render_left
                    });
                    render({ // '-bﾂｱ竏喘^2-4ac'
                        'id': 'P702',
                        'expr': '$' + latex_mbrb2m4ac + '$',
                        'x': render_left
                    });
                    render({ // '(-bﾂｱ竏喘^2-4ac)/2a'
                        'id': 'P801',
                        'expr': latex_kai,
                        'x': render_left,
                        'callback': function () {
                            fadeOut('#Pmsg', {
                                'during': 600
                            });
                        }
                    });
                    switch (false) {
                        case LHS[2].absolute * LHS[1].absolute === 0:
                            // in case a != 0 && b != 0
                            render({
                                'id': 'P001',
                                'expr': '$' + convertToText(LHS[2]) + '$',
                                'x': render_left,
                                'during': speed,
                                'css': {
                                    'color': '#000'
                                }
                            });
                            render({
                                'id': 'P002',
                                'expr': '$' + convertToText(LHS[1], true) + '$',
                                'during': speed,
                                'css': {
                                    'color': '#000'
                                }
                            });
                            break;
                        case LHS[2].absolute === 0:
                            // in case b == 0
                            render({
                                'id': 'P001',
                                'expr': '$' + convertToText(LHS[2]) + '$',
                                'x': render_left,
                                'during': speed,
                                'css': {
                                    'color': '#000'
                                }
                            });
                            render({
                                'id': 'P002',
                                'expr': ''
                            });
                            break;
                        case LHS[1].absolute === 0:
                            // in case a == 0
                            render({
                                'id': 'P002',
                                'expr': '$' + convertToText(LHS[1]) + '$',
                                'x': render_left,
                                'during': speed,
                                'css': {
                                    'color': '#000'
                                }
                            });
                            break;
                        default:
                            return error(0);
                    }
                    if (LHS[0].absolute) {
                        render({
                            'id': 'P003',
                            'expr': '$' + convertToText(LHS[0], true) + '$',
                            'during': speed,
                            'css': {
                                'color': '#000'
                            }
                        });
                    }
                    render({
                        'id': 'Peq',
                        'expr': '$=$',
                        'during': speed,
                        'css': {
                            'color': '#000'
                        }
                    });
                    if (LHS[0].absolute) {
                        render({
                            'id': 'P004',
                            'expr': '$' + convertToText(RHS[0]) + '$',
                            'during': speed,
                            'css': {
                                'color': '#000'
                            }
                        });
                        LHS[0].sign *= -1;
                        render({
                            'id': 'P101',
                            'expr': '$' + convertToText(LHS[0], true) + '$'
                        });
                        render({
                            'id': 'P102',
                            'expr': '$' + convertToText(add_term(LHS[0], RHS[0])) + '$',
                            'callback': function () {
                                nextPhase();
                            }
                        });
                    } else {
                        render({
                            'id': 'P102',
                            'expr': '$' + convertToText(RHS[0]) + '$',
                            'during': speed,
                            'css': {
                                'color': '#000'
                            },
                            'callback': function () {
                                nextPhase(2);
                            }
                        });
                    }
                })();
                break;

            case 1: // Transfer
                if (action !== 1) return error(1);

                startPhase();

                dialog = new Dialog();
                dialog.setTitle('Transfer');
                dialog.onclose = function () {
                    return nextPhase(phase);
                }
                dialog.execute = function () {
                    dialog.onclose = function () {}
                    dialog.close();

                    var rhsleft = $('#P004').offset().left + $('#P004').width() + 4;

                    // move '+c' following with 'd'
                    fadeIn('#P003', {
                        'animate': {
                            'left': rhsleft,
                            'color': '#f00'
                        },
                        'callback': function () {
                            // fade out '+c'
                            fadeOut('#P003');
                            // appear '-c' instead of '+c'
                            fadeIn('#P101', {
                                'css': {
                                    'left': rhsleft + $('#P003').width() - $('#P101').width()
                                },
                                'callback': function () {
                                    // move and hide '-c' follow with '='
                                    fadeOut('#P101', {
                                        'animate': {
                                            'left': $('#P004').offset().left
                                        }
                                    });
                                    // appear '-c'
                                    fadeIn('#P102', {
                                        'css': {
                                            'left': $('#P004').offset().left
                                        },
                                        'callback': function () {

                                            var lhsright;
                                            if (LHS[1].absolute) {
                                                lhsright = $('#P002').offset().left + $('#P002').width() + letter_space;
                                            } else {
                                                lhsright = $('#P001').offset().left + $('#P001').width() + letter_space;
                                            }
                                            switch (true) {
                                                case lhsright < $('#Peq').offset().left:
                                                case $('#P003').width() !== $('#P102').width():
                                                    // move '=' to the right of the lhs for narrowing the space
                                                    $('#Peq').animate({
                                                        'left': lhsright
                                                    }, speed);
                                                    // move '-c' to the right of the lhs for narrowing the space
                                                    $('#P102').animate({
                                                        'left': lhsright + $('#Peq').width() + letter_space
                                                    }, speed, function () {
                                                        nextPhase();
                                                    });
                                                    break;
                                                default:
                                                    // no need to narrow
                                                    nextPhase();
                                            }
                                        }
                                    });
                                    // hide 'd'
                                    fadeOut('#P004');
                                }
                            });
                        }
                    });
                }

                dialog.setScreen(
                    '<div><div id="Dialog">' +
                    'Please choose the term to be transferred.<br />' +
                    '<br />' +
                    '<table style="min-width:60%;margin:auto;"><tbody><tr>' +
                    '<td><input type="button" value="' + convertToText(LHS[2]) + '" onclick="dialog.hide().show(500);" /></td>' +
                    (LHS[1].absolute ? '<td><input type="button" value="' + convertToText(LHS[1]) + '" onclick="dialog.hide().show(500);" /></td>' : '') +
                    (LHS[0].absolute ? '<td><input type="button" value="' + text_c + '" onclick="dialog.execute();" /></td>' : '') +
                    '</tr></tbody></table>' +
                    '</div></div>'
                ).showDialog(500).centering();
                break;

            case 2: // Multiply to both sides
                if (action !== 2) return error(1);

                startPhase();

                dialog = new Dialog();
                dialog.setTitle('Mutiply to both sides');
                dialog.onshow = function () {
                    $('#Dialog .input').focus();
                }
                dialog.onclose = function () {
                    return nextPhase(phase);
                }
                dialog.execute = function () {
                    if (convertToText(parse_term($('#Dialog .input').val(), false)) === text_4a) {
                        dialog.onclose = function () {};
                        dialog.close();
                    } else {
                        return dialog.hide().show(500);
                    }

                    var l;
                    // (two '4a's are  already set to just position)
                    // set the position of '(' to follow with '4a'
                    $('#P203').css({
                        'left': l = render_left + $('#P201').width()
                    });
                    // move 'ax^2' to follow with '('
                    $('#P001').animate({
                        'left': l += $('#P203').width()
                    }, speed);
                    if (LHS[1].absolute) {
                        // move '+bx' to follow with 'ax^2'
                        $('#P002').animate({
                            'left': l += $('#P001').width()
                        }, speed);
                        // set the position of ')' to follow with '+bx'
                        $('#P204').css({
                            'left': l += $('#P002').width()
                        });
                    } else {
                        // set the position of ')' to follow with '+bx'
                        $('#P204').css({
                            'left': l += $('#P001').width()
                        });
                    }
                    // move '=' to follow with ')'
                    $('#Peq').animate({
                        'left': l += $('#P204').width() + letter_space
                    }, speed);
                    // set the position of '4a' to folllow with '='
                    $('#P205').css({
                        'left': l += $('#Peq').width()
                    });
                    // set the position of '(' to follow with '4a'
                    $('#P206').css({
                        'left': l += $('#P205').width()
                    });
                    // move '-c' to follow with '('
                    $('#P102').animate({
                        'left': l += $('#P206').width()
                    }, speed, function () {
                        // appear '4a', '4a', '(', ')', '4a', '(', ')'
                        fadeIn('#P201, #P202, #P203, #P204, #P205, #P206, #P207', {
                            'callback': function () {
                                nextPhase();
                            }
                        });
                    });
                    // set the position of ')' to follow with '-c'
                    $('#P207').css({
                        'left': l += $('#P102').width() + letter_space
                    });
                }

                dialog.setScreen(
                    '<div><div id="Dialog">' +
                    'Please enter the value to be multiplied to both sides.<br />' +
                    '<br />' +
                    '<table style="min-width:60%;margin:auto;"><tbody><tr>' +
                    '<td>' +
                    '<input class="input" type="text" value="" style="width:75%" />' +
                    '<input class="check" type="button" value="Submit" />' +
                    '</td>' +
                    '</tr></tbody></table>' +
                    '</div></div>'
                );
                $('#Dialog .input').on({
                    'keypress': function (e) {
                        if (e.keyCode === 13) dialog.execute();
                    }
                })
                $('#Dialog .check').on({
                    'click': dialog.execute
                });
                dialog.showDialog(500).centering();
                break;

            case 3: // Distribute
                if (action !== 3) return error(1);

                startPhase();

                (function () {
                    // lift up '4a' for multiplying to 'ax^2'
                    $('#P201').animate({
                        'left': $('#P001').offset().left + ($('#P001').width() - $('#P201').width()) / 2,
                        'top': $('#P201').offset().top - $('#P201').height()
                    }, speed, function () {
                        // lift down and hide '4a'
                        fadeOut('#P201', {
                            'animate': {
                                'top': $('#P201').offset().top + $('#P201').height()
                            }
                        });
                        // hide '(', 'ax^2', ')'
                        fadeOut('#P203, #P001, #P204', {
                            'unremove': '#P203'
                        });
                        // appear '4ax^2'  (already set to just position)
                        fadeIn('#P301');
                    });
                    if (LHS[1].absolute) {
                        // lift up '4a' for multiplying to '+bx'
                        $('#P202').animate({
                            'left': $('#P002').offset().left + ($('#P002').width() - $('#P202').width()) / 2,
                            'top': $('#P202').offset().top - $('#P202').height()
                        }, speed, function () {
                            // lift down and hide '4a'
                            fadeOut('#P202', {
                                'animate': {
                                    'top': $('#P202').offset().top + $('#P202').height()
                                }
                            });
                            // hide '+bx'
                            fadeOut('#P002');
                            // appear '+4abx'  (already set to just position)
                            fadeIn('#P302');
                        });
                    }
                    // lift up '4a' for multiplying to '-c'
                    $('#P205').animate({
                        'left': $('#P102').offset().left + ($('#P102').width() - $('#P205').width()) / 2,
                        'top': $('#P205').offset().top - $('#P205').height()
                    }, speed, function () {
                        // lift down and hide '4a'
                        fadeOut('#P205', {
                            'animate': {
                                'top': $('#P205').offset().top + $('#P205').height()
                            }
                        });
                        // appear '-4ac' at '-c'
                        fadeIn('#P303', {
                            'css': {
                                'left': $('#P102').offset().left + $('#P102').width() - $('#P303').width()
                            },
                            'callback': function () {
                                var l;
                                // move '=' following with '+4abx' for narrowing the space
                                $('#Peq').animate({
                                    'left': l = (LHS[1].absolute ?
                                        $('#P302').offset().left + $('#P302').width() + letter_space :
                                        $('#P301').offset().left + $('#P301').width() + letter_space
                                    )
                                }, speed);
                                // move '-4ac' following with '=' for narrowing the space
                                $('#P303').animate({
                                    'left': l + $('#Peq').width() + letter_space
                                }, speed, function () {
                                    nextPhase();
                                });
                            }
                        });
                        // hide '(', '-c', ')'
                        fadeOut('#P206, #P102, #P207');
                    });
                })();
                break;

            case 4: // Add to both sides
                if (action !== 4) return error(1);

                startPhase();

                dialog = new Dialog();
                dialog.setTitle('Add to both sides');
                dialog.onshow = function () {
                    $('#Dialog .input').focus();
                }
                dialog.onclose = function () {
                    return nextPhase(phase);
                }
                dialog.execute = function () {
                    if (convertToText(parse_term($('#Dialog .input').val(), false)) === text_b2) {
                        dialog.onclose = function () {};
                        dialog.close();
                    } else {
                        return dialog.hide().show(500);
                    }

                    var l;
                    // set the position of '+b^2' following with '+4abx'
                    $('#P401').css({
                        'left': l = $('#P302').offset().left + $('#P302').width() + letter_space
                    });
                    // move '=' following with '+b^2'
                    $('#Peq').animate({
                        'left': l += $('#P401').width() + letter_space
                    }, speed);
                    // move '-4ac' following with '='
                    $('#P303').animate({
                        'left': l += $('#Peq').width() + letter_space
                    }, speed, function () {
                        // appear two '+b^2's
                        fadeIn('#P401, #P402', {
                            'callback': function () {
                                // move and hide '+b^2'
                                fadeOut('#P402', {
                                    'animate': {
                                        'left': $('#P403').offset().left
                                    }
                                });
                                // move and hide '-4ac'
                                fadeOut('#P303', {
                                    'animate': {
                                        'left': $('#P403').offset().left + $('#P403').width() - $('#P303').width()
                                    }
                                });
                                // appear 'b^2-4ac'
                                fadeIn('#P403', {
                                    'callback': function () {
                                        nextPhase();
                                    }
                                });
                            }
                        });
                    });
                    // set the position of 'b^2-4ac'
                    $('#P403').css({
                        'left': l
                    });
                    // set the position of '+b^2' following with '-4ac'
                    $('#P402').css({
                        'left': l += $('#P303').width() + letter_space
                    });
                }

                dialog.setScreen(
                    '<div><div id="Dialog">' +
                    'Please enter the value to be added to both sides.<br />' +
                    '<br />' +
                    '<table style="min-width:80%;margin:auto;"><tbody><tr>' +
                    '<td>' +
                    '<input class="input" type="text" value="" style="width:75%" />' +
                    '<input class="check" type="button" value="Submit" />' +
                    '</td>' +
                    '</tr></tbody></table>' +
                    '</div></div>'
                );
                $('#Dialog .input').on({
                    'keypress': function (e) {
                        if (e.keyCode === 13) dialog.execute();
                    }
                });
                $('#Dialog .check').on({
                    'click': dialog.execute
                });
                dialog.showDialog(500).centering();
                break;

            case 5: // Factor
                if (action !== 5) return error(1);

                startPhase();

                (function () {
                    // set the position of '(' (re-using)
                    $('#P203').css({
                        'left': render_left
                    });
                    // set the position of two '+2abx's same as '+4abx'
                    $('#P501, #P502').css({
                        'left': $('#P302').offset().left
                    });
                    // appear '+2abx'
                    fadeIn('#P501');

                    // appear '+2abx' and move following with '+2abx'
                    fadeIn('#P502', {
                        'animate': {
                            'left': $('#P501').offset().left + $('#P501').width() + letter_space
                        }
                    });

                    var distance = letter_space + $('#P502').width() + letter_space;

                    // move '+b^2' with width of '+2ax'
                    $('#P401').animate({
                        'left': $('#P401').offset().left + distance
                    }, speed);
                    // move '=' with width of '+2ax'
                    $('#Peq').animate({
                        'left': $('#Peq').offset().left + distance
                    }, speed);
                    // move 'b^2-4ac' with width of '+2ax'
                    $('#P403').animate({
                        'left': $('#P403').offset().left + distance
                    }, speed);

                    // hide '+4abx'
                    fadeOut('#P302', {
                        'callback': function () {

                            // set the position of '2ax' over '2a' and 'x'
                            $('#P511').css({
                                'left': $('#P301').offset().left + $('#P301').width() - $('#P511').width()
                            });
                            // set the position of '2ax' over '2ax'
                            $('#P512').css({
                                'left': $('#P501').offset().left + $('#P501').width() - $('#P512').width()
                            });
                            // set the position of '+b' over 'b'
                            $('#P513').css({
                                'left': $('#P502').offset().left + $('#P502').width() - $('#P513').width()
                            });
                            // set the position of '+b' over '+2ax'
                            $('#P514').css({
                                'left': $('#P401').offset().left + $('#P401').width() - $('#P514').width()
                            });
                            // set the position of '2a' under '2ax'
                            $('#P515').css({
                                'left': $('#P301').offset().left + $('#P301').width() - $('#P515').width() - $('#P516').width()
                            });
                            // set the position of 'x' under '2ax'
                            $('#P516').css({
                                'left': $('#P515').offset().left + $('#P515').width()
                            });
                            // set the position of '+b' under '2ax'
                            $('#P517').css({
                                'left': $('#P501').offset().left + $('#P501').width() - $('#P517').width()
                            });
                            // set the position of '+2ax' under '+b'
                            $('#P518').css({
                                'left': $('#P502').offset().left + $('#P502').width() - $('#P518').width()
                            });
                            // set the position of '+b' under '+b'
                            $('#P519').css({
                                'left': $('#P401').offset().left + $('#P401').width() - $('#P519').width()
                            });

                            // height of lifting up
                            var liftup = $('#P511').height();

                            // hide '4ax^2', '+2abx', '+2abx', '+b^2'
                            fadeOut('#P301, #P501, #P502, #P401');
                            // appear '2a', 'x', '+b', '+2ax', '+b'
                            fadeIn('#P515, #P516, #P517, #P518, #P519');
                            // appear and lift up '2ax' for factoring from '4ax^2'
                            fadeIn('#P511', {
                                'animate': {
                                    'top': $('#P511').offset().top - liftup
                                },
                                'callback': function () {
                                    var l;
                                    // move all '2ax's following with '('
                                    $('#P511, #P515').animate({
                                        'left': l = render_left + $('#P203').width()
                                    }, speed, function () {
                                        // lift down and hide '2ax'
                                        fadeOut('#P511', {
                                            'animate': {
                                                'top': $('#P511').offset().top + liftup
                                            }
                                        });
                                        // set the position of ')^2' following with '+b'
                                        $('#P521').css({
                                            'left': render_left + $('#P203').width() + $('#P515').width() + $('#P516').width() + letter_space + $('#P517').width()
                                        });
                                        // appear '(', ')^2'
                                        fadeIn('#P203, #P521', {
                                            'callback': function () {
                                                nextPhase();
                                            }
                                        });
                                    });
                                    // move 'x' following with '2a'
                                    $('#P516').animate({
                                        'left': l += $('#P515').width()
                                    }, speed);
                                    // move '=' following with ')^2'
                                    $('#Peq').animate({
                                        'left': l += $('#P516').width() + letter_space + $('#P517').width() + $('#P521').width() + letter_space
                                    }, speed);
                                    // move 'b^2-4ac' following with '='
                                    $('#P403').animate({
                                        'left': l += $('#Peq').width() + letter_space
                                    }, speed);
                                }
                            });
                            // appear and lift up '2ax' for factoring from '+2abx'
                            fadeIn('#P512', {
                                'animate': {
                                    'top': $('#P512').offset().top - liftup
                                },
                                'callback': function () {
                                    // move '2ax' following with '(' and hide
                                    $('#P512').animate({
                                        'left': render_left + $('#P203').width()
                                    }, speed, function () {
                                        fadeOut('#P512', {
                                            'duration': 0
                                        });
                                    });
                                    // move '+b' following with '2a' and 'x'
                                    $('#P517').animate({
                                        'left': render_left + $('#P515').width() + letter_space + $('#P516').width() + letter_space
                                    }, speed);
                                }
                            });

                            // appear and lift up '+b' for factoring from '+2abx'
                            fadeIn('#P513', {
                                'animate': {
                                    'top': $('#P513').offset().top - liftup
                                },
                                'callback': function () {
                                    // move '+b' following with '2ax'
                                    $('#P513').animate({
                                        'left': render_left + $('#P203').width() + $('#P511').width() + letter_space
                                    }, speed, function () {
                                        // lift down and hide '+b'
                                        fadeOut('#P513', {
                                            'animate': {
                                                'top': $('#P513').offset().top + liftup
                                            }
                                        });
                                    });
                                    // move '2ax' followinig with '('
                                    $('#P518').animate({
                                        'left': render_left + $('#P203').width()
                                    }, speed, function () {
                                        fadeOut('#P518', {
                                            'duration': 0
                                        });
                                    });
                                }
                            });

                            // appear and lift up '+b' for factoring from '+b^2'
                            fadeIn('#P514', {
                                'animate': {
                                    'top': $('#P514').offset().top - liftup
                                },
                                'callback': function () {
                                    // move '+b' following with '2ax'
                                    $('#P514').animate({
                                        'left': render_left + $('#P203').width() + $('#P511').width() + letter_space
                                    }, speed, function () {
                                        fadeOut('#P514', {
                                            'duration': 0
                                        });
                                    });
                                    // move '+b' following with 'x'
                                    $('#P519').animate({
                                        'left': render_left + $('#P515').width() + letter_space + $('#P516').width() + letter_space
                                    }, speed, function () {
                                        fadeOut('#P519', {
                                            'duration': 0
                                        });
                                    });
                                }
                            });
                        }
                    });
                })();
                break;

            case 6: // Square root both sides
                if (action !== 6) return error(1);

                startPhase();

                (function () {

                    var l;
                    // set position of the 'ﾂｱ竏喘^2-4ac' following with '='
                    $('#P601').css({
                        'left': l = $('#Peq').offset().left + $('#Peq').width() + letter_space
                    });
                    // move 'b^2-4ac'
                    $('#P403').animate({
                        'left': l + $('#P601').width() - $('#P403').width()
                    }, speed, function () {
                        // hide '(', ')^2'
                        fadeOut('#P203, #P521');
                        // hide 'b^2-4ac'
                        fadeOut('#P403');
                        // appear 'ﾂｱ竏喘^2-4ac'
                        fadeIn('#P601', {
                            'callback': function () {
                                var l;
                                // move '2a' to the left-end for nallowing space
                                $('#P515').animate({
                                    'left': l = render_left
                                }, speed);
                                // move 'x' following with '2a' for nallowing space
                                $('#P516').animate({
                                    'left': l += $('#P515').width()
                                }, speed);
                                // move '+b' following with 'x' for nallowing space
                                $('#P517').animate({
                                    'left': l += $('#P516').width() + letter_space
                                }, speed);
                                // move '=' following with '+b'
                                $('#Peq').animate({
                                    'left': l += $('#P517').width() + letter_space
                                }, speed);
                                // move 'ﾂｱ竏喘^2-4ac'
                                $('#P601').animate({
                                    'left': l + $('#Peq').width() + letter_space
                                }, speed, function () {
                                    nextPhase();
                                });
                            }
                        });
                    });
                })();
                break;

            case 7: // Transfer
                if (action !== 1) return error(1);

                startPhase();

                dialog = new Dialog();
                dialog.setTitle('Transfer');
                dialog.onclose = function () {
                    return nextPhase(phase);
                }
                dialog.execute = function () {
                    dialog.onclose = function () {}
                    dialog.close();

                    var l;

                    // move '+b' following with 'ﾂｱ竏喘^2-4ac'
                    $('#P517').animate({
                        'left': l = $('#P601').offset().left + $('#P601').width() + letter_space + ($('#P517').width() > $('#P701').width() ? 0 : $('#P701').width() - $('#P517').width()),
                        'color': '#f00'
                    }, speed, function () {
                        // appear '-b'
                        fadeIn('#P701', {
                            'css': {
                                'left': l + $('#P517').width() - $('#P701').width()
                            },
                            'callback': function () {

                                // set the position of '-bﾂｱ竏喘^2-4ac' and appear
                                fadeIn('#P702', {
                                    'css': {
                                        'left': $('#P601').offset().left
                                    },
                                    'callback': function () {
                                        var l;
                                        // move '=' following with 'x'
                                        $('#Peq').animate({
                                            'left': l = $('#P516').offset().left + $('#P516').width() + letter_space
                                        }, speed);
                                        // move '-b' following with '='
                                        $('#P702').animate({
                                            'left': l += $('#Peq').width() + letter_space
                                        }, speed, function () {
                                            nextPhase();
                                        });
                                    }
                                });
                                // move and hide 'ﾂｱ竏喘^2-4ac'
                                fadeOut('#P601', {
                                    'animate': {
                                        'left': $('#P701').offset().left + $('#P701').width() - $('#P601').width()
                                    }
                                });
                                // move and hide '-b'
                                fadeOut('#P701', {
                                    'animate': {
                                        'left': $('#P702').offset().left
                                    }
                                });
                            }
                        });
                        // hide '+b'
                        fadeOut('#P517');
                    });
                }

                dialog.setScreen(
                    '<div><div id="Dialog">' +
                    'Please choose the term to be transferred.<br />' +
                    '<br />' +
                    '<table style="min-width:80%;margin:auto;"><tbody><tr>' +
                    '<td><input type="button" value="' + text_2ax + '" onclick="dialog.hide().show();" /></td>' +
                    (LHS[1].absolute ? '<td><input type="button" value="' + text_b + '" onclick="dialog.execute();" /></td>' : '') +
                    (LHS[0].absolute ? '<td><input type="button" value="' + text_rb2m4ac + '" onclick="dialog.hide().show(500);" /></td>' : '') +
                    '</tr></tbody></table>' +
                    '</div></div>'
                );
                dialog.showDialog(500).centering();
                break;

            case 8: // Cross Multiply
                if (action !== 7) return error(1);

                startPhase();

                (function () {
                    // set the position of '(-bﾂｱ竏喘^2-4ac)/2a' following with '='
                    $('#P801').css({
                        'left': $('#Peq').offset().left + $('#Peq').width() + 2,
                        'top': $('#Peq').offset().top + ($('#Peq').height() - $('#P801').height()) / 2
                    });

                    var liftup = $('#P702').height() / 2;
                    var movewidth = ($('#P801').width() - $('#P702').width()) / 2 - 2;
                    // lift up '-bﾂｱ竏喘^2-4ac'
                    $('#P702').animate({
                        'top': $('#P702').offset().top - liftup,
                        'left': $('#P702').offset().left + movewidth
                    }, 1000);
                    //  move '2a' to RHS
                    $('#P515').animate({
                        'top': $('#P515').offset().top + $('#P702').height() / 2 + 3,
                        'left': $('#P801').offset().left + ($('#P801').width() - $('#P515').width()) / 2
                    }, 1000, function () {
                        // fadeOut '-bﾂｱ竏喘^2-4ac', '2a'
                        fadeOut('#P702, #P515');
                        // appear '(-bﾂｱ竏喘^2-4ac)/2a'
                        fadeIn('#P801', {
                            'callback': function () {
                                nextPhase();
                            }
                        });
                    });
                })();
                break;

            default:
                error(1);
        }
    }
    // start this phase
    function startPhase(argPhase) {
        if (processing === false) {
            processing = true;
            disableButtons(true);
            if (argPhase !== undefined) phase = argPhase;
        }
    }
    // finish this phase and proceed to next
    function nextPhase(argPhase) {
        if (processing) {
            processing = false;

            phase = (argPhase === undefined ? phase + 1 : argPhase);
            if (phase < 9) {
                disableButtons(false);
            } else {
                $('#parse').prop('disabled', false);
                $('#inp').focus().select();
            }
        }
    }
    // the wrapper of the function 'animate' of the JQuery UI
    function fadeIn(selector, args = {}) {
        if (args.css !== undefined) $(selector).css(args.css);
        switch (true) {
            case args.animate === undefined:
                args.animate = {}
            case args.animate.color === undefined:
                args.animate.color = '#000';
                break;
        }
        return $(selector).animate(
            args.animate,
            (args.duration === undefined ? speed : args.duration),
            (args.easing === undefined ? 'swing' : args.easing),
            (args.callback === undefined ? function () {} : args.callback)
        );
    }
    // the wrapper of the function 'animate' of the JQuery UI
    function fadeOut(selector, args = {}) {
        if (args.css !== undefined) $(selector).css(args.css);
        switch (true) {
            case args.animate === undefined:
                args.animate = {}
            case args.animate.color === undefined:
                args.animate.color = 'transparent';
                break;
        }
        return $(selector).animate(
            args.animate,
            (args.duration === undefined ? speed : args.duration),
            (args.easing === undefined ? 'swing' : args.easing),
            function () {
                $(selector).not(args.unremove).remove();
                if (args.callback !== undefined) args.callback();
            });
    }
});