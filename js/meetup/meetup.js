var $parameters = {
    urlname: "geek-meetup-chennai",
    width: 500,
    _name: "Meetup Group Stats",
    _description: "Shows basic stats on your favorite Meetup group."
};

var $queries = {
    groups: function () {
        return mup_widget.api_call("/2/groups", {
            group_urlname: $parameters.urlname
        });
    },
    events: function () {
        return mup_widget.api_call("/2/events", {
            group_urlname: $parameters.urlname,
            page: '1'
        });
    },
    past_events: function () {
        return mup_widget.api_call("/2/events", {
            group_urlname: $parameters.urlname,
            page: '100',
            status: 'past'
        })
    }
};

var load_widget = function ($, ctx) {
    var group = '',
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        addLink = function (content, link) {
            return '<a target="_blank" href="' + link + '">' + content + '</a>';
        },
        addImage = function (src, alt) {
            return src == "" ? '' : '<div class="mup-img-wrap"><img src="' + src + '" width="' + (
                $parameters.width - 50) + '" alt="' + alt + '" class="mup-img"/></div>';
        },

        // Meetup Rating add star

        // addStarRating = function (rating) {
        //     var base_url =
        //         'https://a248.e.akamai.net/secure.meetupstatic.com/img/03784007994490629714917/star_';
        //     var starlink = '';
        //     if (rating == 0) {
        //         return 'Not Yet Rated';
        //     } else if (rating < 1.25) {
        //         starlink = "100.png";
        //     } else if (rating < 1.75) {
        //         starlink = "150.png";
        //     } else if (rating < 2.25) {
        //         starlink = "200.png";
        //     } else if (rating < 2.75) {
        //         starlink = "250.png";
        //     } else if (rating < 3.25) {
        //         starlink = "300.png";
        //     } else if (rating < 3.75) {
        //         starlink = "350.png";
        //     } else if (rating < 4.25) {
        //         starlink = "400.png";
        //     } else if (rating < 4.75) {
        //         starlink = "450.png";
        //     } else {
        //         starlink = "500.png";
        //     }
        //     return '<img src="' + base_url + starlink + '" alt="' + rating + '" />';

        // },
        addLeadingZero = function (num) {
            return (num < 10) ? ('0' + num) : num;
        },
        getFormattedDate = function (millis) {
            var date = new Date(millis);
            return months[date.getMonth()] + ' ' + addLeadingZero(date.getDate()) + ', ' + date.getFullYear()
                .toString();
        },
        getFormattedTime = function (millis) {
            var time = new Date(millis),
                hours = time.getHours(),
                min = time.getMinutes(),
                ampm = (hours > 11) ? 'PM' : 'AM';
            min = (min < 10) ? ('0' + min) : min;
            hours = (hours == 0) ? 1 : hours;
            hours = (hours > 12) ? hours - 12 : hours;
            return hours + ':' + min + ' ' + ampm;
        },
        numberFormat = function (nStr) {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1))
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            return x1 + x2;
        };
    $.getJSON($queries.groups(), function (data) {
        if (data.results.length == 0) {
            $('.mug-badge', ctx).append(
                '<div class="mup-widget error">\
							<div class="errorMsg">Oops. No results for "' +
                $parameters.urlname + '"</div>\
					</div>');
        } else {
            group = data.results[0];
            $('.mug-badge', ctx).append(
                '<div class="mup-widget ">\
					<div class="mup-bd">\
						<h3>' + addLink(
                    group.name, group.link) +
                '</h3>\
            <h4> <div style="padding-top:5px;"><span class="mup-tlabel mup-est">EST. ' +
                getFormattedDate(group.created) +
                '</span></div></h4>\
						<span class="mup-stats">' + addImage(group[
                    "group_photo"] ? group.group_photo.photo_link : "", group.name) +
                numberFormat(group.members) + '<span class="mup-tlabel mup-who"> ' + group.who +
                '</span></span>\
            <span class="mup-stats mup-meetups"><div class="next-event"></div></span>\
					</div>\
					<div class="mup-ft">\
                         <div class="mup-logo"><div style="float:left;">' +

                // Meetup Logo

                // addLink(
                //     '<img src="https://a248.e.akamai.net/secure.meetupstatic.com/img/84869143793177372874/birddog/everywhere_widget.png">',
                //     'http://www.meetup.com') +

                // Meetup Rating

                // '</div><div style="float:right;"><div style="float:right;">' +
                // addStarRating(group.rating) +
                // '</div><br><div style="float:right;"><span class="mup-tlabel">Group Rating</span></div></div>' +

                '</div>'
            );

            $.getJSON($queries.events(), function (data) {
                if (data.status && data.status.match(/^200/) == null) {
                    alert(data.status + ": " + data.details);
                } else {
                    if (data.results.length == 0) {
                        $('.next-event', ctx).append('<span class="mup-tlabel mup-meetups">No Jams at the Moment.\
                        <br>\
                         Subscribe to our Mailing List to be Notified.</span>');
                    } else {
                        var event = data.results[0];
                        console.log(event);
                        var venue = event.venue;
                        console.log(venue);
                        var city;
                        if (!venue || !venue.city) {
                            city = group.city;
                        } else {
                            city = venue.city;
                        }
                        var state_country;
                        if (!venue || !venue.state) {
                            if (group.state == "") {
                                state_country = group.country.toUpperCase();
                            } else {
                                state_country = group.state;
                            }
                        } else {
                            state_country = venue.state;
                        }
                        var venue_addr;
                        if (venue) {
                            if (venue.name !== undefined) {
                                venue_addr = venue.name + " - ";
                            } else if (venue.address_1 !== undefined) {
                                venue_addr = venue.address_1 + " - ";
                            } else {
                                venue_addr = "";
                            }
                        } else {
                            venue_addr = "";
                        }
                        var location = venue_addr + city + ", India";
                        $('.next-event', ctx).append("<div class='mup-tlabel mupn-heading'> \
                            <a target='_blank' href='"+ event.event_url + "'>" + event.name + "</a> \
                            </div>" + '<div class="mup-tlabel">' +
                            getFormattedDate(event.time) + '   |   ' +
                            getFormattedTime(event.time) + "</div>" +
                            '<div class="mup-tlabel">' + location + "</div>");
                    }
                }
            });

            $.getJSON($queries.past_events(), function (data) {

                if (data.status && data.status.match(/^200/) == null) {
                    alert(data.status + ": " + data.details);
                } else {
                    if (data.results.length == 0) {
                        $('.mupast-widget', ctx).append('<div class="mupast-nojams">No Jams</div>');
                    }

                    else {
                        $('.mug-badge', ctx).append('<div class="mupast-widget"> \
                            <div class="mupast-heading">Past Jams</div> \
                        </div>');

                        $('.mupast-widget', ctx).append('<div class="mupast-meetups"></div>');
                        let past_events_array = data.results.reverse().slice(0, 5);
                        for (var i in past_events_array) {
                            let event = past_events_array[i];
                            $('.mupast-meetups', ctx).append('<div class="mupast-main"> \
                                <div class= "mupast-inner"> \
                                    <div class="mupast-inner-text">' + getFormattedDate(event.time).replace(',', '') + ' </div> \
                                    </div> \
                                        <div class="mupast-content"> \
                                            <div class="mupast-widget-heading"><a href="' + event.event_url + '" target="_blank">' + event.name + '</a></div> \
                                        </div> \
                                    </div>');
                        }
                    }
                }

            });
        }
    });
};




document.addEventListener('DOMContentLoaded', () => {

    mup_widget.with_jquery(load_widget);

    var location_select = document.getElementById('meetup-location');

    location_select.addEventListener('change', function () {
        let location = location_select.value;

        document.querySelector('.mug-badge').innerHTML = '';

        $parameters.urlname = 'geek-meetup-' + location;

        mup_widget.with_jquery(load_widget);
    });
});
