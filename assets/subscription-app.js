(function($, App) {
  
  App.ajax = function(resource, params, type, callback) {
    params.ajax = true;
    
    $.ajax(App.url+'/ajax_'+resource, {
      dataType: type,
      data: params
    })
    .done(function(data) {
      if(data.error) {
        App.notification.show(data.message);
      } else {
        if(data.warning) {
          App.notification.show(data.message);
        }
        callback(data);
      }
      
      $('.subscription-form [type="submit"]').removeAttr('disabled');
    })
    .fail(function(a,b,c) {
      $('.subscription-form input[type="submit"]').removeAttr('disabled');
      App.notification.show('Something went wrong. Please try again.');
      console.log(a);
      console.log(b);
      console.log(c);
    });
  };
  
  App.getUrlVar = function(variable) {
    var result = false;

    window.location.search.substring(1).split('&').forEach(function(param) {
      if(param.split("=")[0]===variable) result=decodeURI(param.split("=")[1]);
    });

    return result;
  }

  App.imgURL = function(src, size) {
    if(!src) return '';
    
    // remove any current image size then add the new image size
    return src
      .replace(/_(pico|icon|thumb|small|compact|medium|large|grande|original|1024x1024|2048x2048|master)+\./g, '.')
      .replace(/\.jpg|\.png|\.gif|\.jpeg/g, function(match) {
        return '_'+size+match;
      })
    ;
  };

  App.notification = {
    
    show: function(message) {
      $('.account-alert h3').html(message);
      $('.account-alert').show();
      $(document).scrollTop(0);
    },
    
    hide: function() {
      $('.account-alert').hide();
    }
    
  };
  
  App.updateEmail = function(e) {
  	e.preventDefault();
    
    var $self = $(this);
    var email = $self.find('[name="email"]').val();
    var email_conf = $self.find('[name="email_confirmation"]').val();
    
    if(email!==email_conf) {
      App.notification.show('The emails you entered do not match.');
      return false;
    }
    
    var params = {
      email: email, 
      shop: App.shop, 
      customer: App.customer
    };
    
    $self.find('[type="submit"]').attr('disabled', 'disabled');
    
    App.ajax('update_email', params, 'jsonp', function() {
      App.notification.show('Your accounts email has been updated.');
    });
  };
  
  App.termInfo = function() {
  	var $self = $(this);
    var term = $self.data('val');
    var $form = $self.parents('form');
    var product = $form.find('[name="product"]').val();
    var type = $form.find('[name="type"]').val();
    
    var params = { 
      term: term, 
      type: type, 
      shop: App.shop, 
      product: product 
    };

    App.ajax('get_term_info', params, 'jsonp', function(data) {
      $form.find('.payment-plan span').removeClass('selected');
      $self.addClass('selected');

      $form.find('.price').text('£'+(+data.price).toFixed(2));
      $form.find('.ppm').text('£'+(+data.price/term).toFixed(2));
      $form.find('.months').text(term);

      $form.find('[name="term"]').val(term);
    });
  };
  
  App.updateSubscriptionTerm = function(e) {
    e.preventDefault();
    
    var $self = $(this);
    var subscription = $self.find('[name="subscription"]').val();
    var term = $self.find('[name="term"]').val();
    var product = $self.find('[name="product"]').val();
    var type = $self.find('[name="type"]').val();
    
    var params = {
      term: term, 
      type: type, 
      shop: App.shop, 
      product: product,
      subscription: subscription,
      customer: App.customer
    };
    
    $self.find('[type="submit"]').attr('disabled', 'disabled');
    
    App.ajax('update_subscription_term', params, 'jsonp', function() {
      App.getSubscriptions(App.displaySubscriptions);
      App.notification.show('Your subscriptions billing period has been updated.');
      $.fancybox.close();
    });
  };
  
  App.extendSubscription = function(e) {
    e.preventDefault();
    
    var $self = $(this);
    var subscription = $self.find('[name="subscription"]').val();
    var term = $self.find('[name="term"]').val();
    var product = $self.find('[name="product"]').val();
    var type = $self.find('[name="type"]').val();
    
    var params = {
      term: term, 
      type: type, 
      shop: App.shop, 
      product: product,
      subscription: subscription,
      customer: App.customer
    };
    
    $self.find('input[type="submit"]').attr('disabled', 'disabled');
    
    App.ajax('extend_subscription', params, 'jsonp', function() {
      App.getSubscriptions(App.displaySubscriptions);
      App.notification.show('Your subscription will be extended once payment has been processed, a confirmation email will follow.');
      $.fancybox.close();
    });
  };
  
  App.renewSubscription = function(e) {
    e.preventDefault();
    
    var $self = $(this);
    var subscription = $self.find('[name="subscription"]').val();
    var term = $self.find('[name="term"]').val();
    var product = $self.find('[name="product"]').val();
    
    $self.find('[type="submit"]').attr('disabled', 'disabled');
    
    var params = {
      term: term, 
      shop: App.shop, 
      product: product,
      subscription: subscription,
      customer: App.customer
    };
    
    App.ajax('renew_subscription', params, 'jsonp', function() {
      window.location.href = '/account?notify=Your subscription will be renewed once payment has been processed, a confirmation email will follow.';
    });
  };
  
  App.updateExpiry = function(e) {
    e.preventDefault();
    
    var $self = $(this);
    var subscription = $self.find('[name="subscription"]').val();
    var date = $self.find('[name="new_date"]').val();
    
    $self.find('[type="submit"]').attr('disabled', 'disabled');
    
    var params = {
      shop: App.shop, 
      subscription: subscription,
      new_date: date,
      customer: App.customer
    };
    
    App.ajax('update_expiry', params, 'jsonp', function() {
      window.location.href = '/account?notify=Your subscriptions delivery date has been successfully updated';
    });
  };
  
  App.updatePaymentInfo = function(e) {
    var $self = $(this);
    var data = window.location.search;
    
    App.ajax(
      'update_payment_info'+data, 
      { ajax: true, shop: App.shop, customer: App.customer }, 
      'jsonp', 
      function() {
      	App.notification.show('Your payment information has been updated');
      }
    );
    
    window.history.pushState('account', 'Title', '/account');
  };
  
  App.getSubscriptions = function(callback) {
    App.ajax(
      'subscriptions',
      { customer: App.customer, shop: App.shop }, 
      'jsonp', 
      callback
    );
  };
  
  App.getSubscription = function(id, callback) {
    App.ajax(
      'subscription',
      { subscription: id, customer: App.customer, shop: App.shop }, 
      'jsonp', 
      callback
    );
  }; 
  
  App.getPauses = function(id, callback) {
    App.ajax(
      'get_pauses',
      { subscription: id, customer: App.customer, shop: App.shop }, 
      'jsonp', 
      callback
    );
  };
  
  App.pause = function() {
    var $self = $(this);
    var id = $('[name="subscription"]').val();
    
    if($self.is(':checked')) {
      App.ajax('set_pause', { subscription: id, customer: App.customer, shop: App.shop, pause_date: this.value }, 'jsonp', function(response) {
        if(response) {
          $self.attr('name', response);
          $self.attr('checked', true);
          $self.next('label').append('<span> - this delivery will be skipped</span>');
        }
      });
    } else {
      App.ajax('unset_pause', { subscription: id, customer: App.customer, shop: App.shop, pause_id: $self.attr('name') }, 'jsonp', function() {
        $self.attr('checked', false);
        $self.next('label').find('span').remove();
      });
    }
  }
  
  App.cancelSubscription = function(e) {
    e.preventDefault();
    
    var $self = $(this);
    var subscription = $self.data('subscription');
    var cancelReason = $self.find('[name="cancel_reason"]').val() || '';
    
    $self.find('input[type="submit"]').attr('disabled', 'disabled');
    
  	App.ajax(
      'cancel_subscription',
      { customer: App.customer, shop: App.shop, subscription: subscription, reason: cancelReason },
      'jsonp',
      function() {
        // reload the subscriptions to show the changes
      	App.getSubscriptions(App.displaySubscriptions);
        App.notification.show('Your subscription has been cancelled, you can now view it in your list of inactive licences.');
       	$.fancybox.close();
      }
    );
  };
  
  App.displaySubscriptionPaymentDetail = function(order) {
    App.ajax('get_payment_detail', { order: order, shop: App.shop }, 'jsonp', function(data) {
      if(!data.details) return false;
      
      var detailTxt = '';
      
      if(~data.details.toLowerCase().indexOf('initial')) {
        detailTxt += 'An initial subscription payment';
      } else if(~data.details.toLowerCase().indexOf('extension')) {
        detailTxt += 'A subscription extension';
      } else if(~data.details.toLowerCase().indexOf('renewal')) {
        detailTxt += 'A subscription renewal';
      } else if(~data.details.toLowerCase().indexOf('subscription payment')) {
        detailTxt += 'A subscription payment';
      } else {
      	return false;
      }
      
      $('[data-order]').show().find('span').html(detailTxt);
    });
  };
      
  App.formatExpiry = function(date) {
    date = date.split(' ')[0].replace(/-/g, '/');
    date = new Date(date);
    date = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
    date = date.replace(/\b(\d{1})\b/g, '0$1');
    return date;
  };

  // retrieve all the subscription data for the logged in customer and display 
  // them using a template
  App.displaySubscriptions = (function() {
    var subscriptions = {
      active: '',
      inactive: '',
      $templateElem: '.subscription-clone',
      $activeElem: '.subscription-loop.active-subscriptions',
      $inactiveElem: '.subscription-loop.inactive'
    };
    
    subscriptions.template = function() {
      var string = this.$templateElem
      	.clone()
      	.removeClass('license-clone')
      	.show()
      	[0].outerHTML
      ;
      
      return string;
    };
    
    subscriptions.status = function(subscription) {
      if(subscription.status.toLowerCase()==='active' && subscription.type.toLowerCase()==='recurring') {
        return 'Next Payment due '+App.formatExpiry(subscription.expiry_date);
      } else if(subscription.status.toLowerCase()==='payment failed') {
        return 'Payment failed on '+App.formatExpiry(subscription.expiry_date);
      } else {
      	return 'Cancelled';
      }
    }
    
    subscriptions.cancel_text = function(subscription) {
      if(subscription.status.toLowerCase()==='active') {
        return '<p class="fail-info cancel-text" style="display:none;">Are you sure? Cancelling this subscription means that once it expires on '+App.formatExpiry(subscription.expiry_date)+' it will no longer automatically renew and no additional charges will be taken from your account.<br /> <a href="#" class="yes-cancel" data-subscription="'+subscription.id+'" style="text-decoration:underline;">Cancel subscription</a></p>';
      } else {
      	return '';
      }
    };
    
    subscriptions.term_options = function(subscription) {
      function term_option(val) {
        if(''+val.toLowerCase()==='perpetual') return '';
        return '<span data-val="'+val+'" class="term-option '+(val==subscription.term?'selected':'')+'">'+val+'</span>';
      }
      
      return subscription.options.term_options.map(term_option).join('');
    }
    
    subscriptions.actions = function(subscription) {
      	var html = '';
        var status = subscription.status.toLowerCase();
      
      	if(status==='active') {
          html += '<a href="?view=change-delivery&subscription='+subscription.id+'">Change delivery day</a>';
          html += '<a href="?view=pause-subscription&subscription='+subscription.id+'">Pause subscription</a>';
          html += '<a href="#" class="cancel-action">Cancel subscription</a>';
        } else {
          html += '<a href="?view=renew-subscription&subscription='+subscription.id+'">Renew subscription</a>';
        }
      
      	return html;
    };
    
    // mini templating engine
    subscriptions.renderTemplate = function(subscription) {
      // replace any occurences of str with a matching key:value pair
      function replacements(str, replacement) {
        return str.replace(/{([^}]+)}/g, function (match) {
          return replacement[match];
        });
      }
      
      return replacements(this.template(), {
        '{ subscription.id }': subscription.id,
        '{ subscription.payment_class }': subscription.status.toLowerCase().replace(' ', '-').replace('payment-',''),
        '{ subscription.payment_status }': this.status(subscription),
        '{ subscription.term }': subscription.term,
        '{ subscription.amount }': '£'+(+subscription.variant_price).toFixed(2),
        '{ subscription.amount_per_month }': '£'+(+subscription.variant_price/subscription.term).toFixed(2),
        '{ subscription.product.title }': subscription.product,
        '{ subscription.product.image }': '<img src="'+App.imgURL(subscription.featured_image, '150x150_cropped')+'" />',
        '{ subscription.cancel_text }': this.cancel_text(subscription),
        '{ subscription.actions }': this.actions(subscription),
        '{ subscription.term_options }': this.term_options(subscription),
        '{ subscription.product_id }': subscription.product_id,
        '{ subscription.expiry_date }': App.formatExpiry(subscription.expiry_date)
      });
    }
    
    subscriptions.display = function(data) {
      var self = subscriptions;
      self.active = '';
      self.inactive = '';
      
      subscriptions.$templateElem = $(self.$templateElem);
      subscriptions.$activeElem = $(self.$activeElem);
      subscriptions.$inactiveElem = $(self.$inactiveElem);

      data.subscriptions.forEach(function(subscription) {
      	self[subscription.status.toLowerCase()==='active'?'active':'inactive'] += self.renderTemplate(subscription);
      });

      if(self.active.length) self.$activeElem.empty().append(self.active);
      if(self.inactive.length) self.$inactiveElem.empty().append(self.inactive);
     
      if(!self.active.length && !self.inactive.length) $('.active-subscriptions h4').show();
    }
    
    return subscriptions.display;
  })();
  
  App.deliveryDatePicker = function(subscription) {
    var defaultDate = App.formatExpiry(subscription.expiry_date);
    $('[name="new_date"]').val(defaultDate);
    
    $('#datepicker').datepicker({
      beforeShowDay: function(d){
        var dy = d.getDay();
        if(dy == 0) {
          return[false,"closed"]
        } else {
          return[true,""]
        }
      },
      minDate:'+1d',
      defaultDate: new Date(defaultDate),
      onSelect: function(date) {
        // take 1 day and move to the format yyyy/mm/dd
        date = new Date(date);
        date.setDate(date.getDate() - 1);
        $('[name="new_date"]').val(date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
      }
    });

    $('.datepicker-trigger').click(function(){
      $('#datepicker').toggle();
    });
  }
  
  App.listPauses = function($elem, pauses) {
    var html = '';
    
    function listPause(pause, past) {
      var date = pause.date.substr(0, 10).replace(/-/g, '/');
      date = new Date(date);
      date = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
      date = date.replace(/\b(\d{1})\b/g, '0$1');
      var status = '';
      
      if(pause.active && pause.status) {
        status = '<span>- '+pause.status+'</span>';
      }
      
      html += '<input type="checkbox" name="'+pause.id+'" class="subscription-pause" value="'+pause.date+'" '+(pause.active?'checked':'')+' '+(past?'disabled':'')+'>';
      html += '<label>'+date+' '+status+'</label>';
    }
    
    pauses.past_dates.forEach(function(pause) {
      listPause(pause, true);
    });
    
    pauses.future_dates.forEach(function(pause) {
      listPause(pause, false);
    });
    
    $elem.append(html);
  }
  
  App.insertSubscriptionData = function(subscription) {
    // if a subscription id was passed get the subscription 
    // before performing any inserts
    if($.isNumeric(subscription))
      return App.getSubscription(subscription, App.insertSubscriptionData);
    
    $('[data-subscription-product-image]').attr('src', App.imgURL(subscription.featured_image, 'grande'));
    $('[data-subscription-product-title]').text(subscription.product);
    $('[data-subscription-amount]').text('£'+(+subscription.variant_price).toFixed(2));
    $('[data-subscription-term]').text(subscription.term);
    $('[data-subscription-expiry]').text(App.formatExpiry(subscription.expiry_date));
    $('[data-subscription-card-number]').text(subscription.card.masked_card_number);
    $('[data-subscription-card-type]').attr('src', App.url+'/images/'+subscription.card.type.toLowerCase().replace('American Express', 'amex')+'.png');
    $('[data-subscription-card-expiry]').text(subscription.card.expiry);
    $('[data-subscription-url]').attr('href', $('[data-subscription-url]').attr('href')+'&subscription='+subscription.id);

    $('input[name="subscription"]').val(subscription.id);
    $('input[name="product"]').val(subscription.product_id);
    $('input[name="term"]').val(subscription.term);
    
    if($('#datepicker').length) App.deliveryDatePicker(subscription);
    
    if($('[data-subscription-pauses]').length) {
      App.getPauses(subscription.id, function(pauses) {
        App.listPauses($('[data-subscription-pauses]'), pauses);
      });
    }
  }
  
  
  App.revealDuplicates = function() {
    function reveal(duplicates) {
      duplicates.forEach(function(duplicate) {
        $('.cart-item[data-variant="'+duplicate.variant_id+'"] .subscription-info .alert-txt').fadeIn();
      });
    }
    
    $.getJSON('/cart.js', function(data){
      App.ajax('find_duplicates', { 
        ajax: true, 
        shop: App.shop, 
        customer: App.customer, 
        line_items: data.items 
      }, 'jsonp', reveal);
    });
  }
  
  $(function() {
    
    console.log("loaded up 0");
  	
    $('.account-alert .close-alert').click(App.notification.hide);
    
    console.log("loaded up 1");
    
    $('.subscription-form[action="update-email"]').submit(App.updateEmail);
    
    console.log("loaded up 2");
    
    if($('.subscription-loop').length) App.getSubscriptions(App.displaySubscriptions);
    
    console.log("loaded up 3");
    
    if($('[data-order]').length) App.displaySubscriptionPaymentDetail($('[data-order]').data('order'));
    
    console.log("loaded up 4");
    
    $(document)
      .on('submit', '.subscription-form[action="renew-subscription"]', App.renewSubscription)
      .on('submit', '.subscription-form[action="update-expiry"]', App.updateExpiry)
      .on('change', '.subscription-pause', App.pause)
      .on('click', '.cancel-action', function(e) {
      	e.preventDefault();
        console.log("clicked me");
      	$(this).parents('.actions').hide(); 
      	$(this).parents('.info-wrap').find('.cancel-text').show();
      }) 
      .on('click', '.yes-cancel', App.cancelSubscription)
    ;

    console.log("loaded up 5");
    
    if($('.subscription-info .alert-txt').length) App.revealDuplicates();
    
    console.log("loaded up 6");
    
    var notify = App.getUrlVar('notify');
    var subId = App.getUrlVar('subscription');
    
    if(subId) App.insertSubscriptionData(subId);
    if(notify) App.notification.show(notify);
  });
  
})(jQuery, SubscriptionApp);