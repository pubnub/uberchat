(function ($) {

  $.fn.uberchat = function (options) {
    
    var defaults = {
      publish_key: 'demo',
      subscribe_key: 'demo',
      domain: 'pubnub.com',
      instance: '1',
      username: 'guest',
      title: 'Lobby Chat',
      admins: []
    };

    options = $.extend({}, defaults, options);

    var $container = this;

    var pubnub = null;
    var me = null;
    var Users = null;

    var channel = ['uber_chat', options.domain, options.instance].join('-');
    var auto_scroll = true;
    var history_obj = {};

    var $input = null;
    var $output = null;

    var User_factory = null;
    var User = null;
    var Client = null;

    User_factory = function () {

      var user_list = {};
      var self = this;

      self.remove = function (uuid) {
        delete user_list[uuid];
      };

      self.get = function (uuid) {
        if (!user_list.hasOwnProperty(uuid)) {
          console.error('Trying to retrieve user that is not present.');
        }
        return user_list[uuid];
      };

      self.set = function (uuid) {
        if (!user_list.hasOwnProperty(uuid)) {
          user_list[uuid] = new User(uuid);
        }
        return user_list[uuid];
      };

      self.all = function () {
        return user_list;
      };

    };

    User = function (uuid) {

      var self = this;

      self.uuid = uuid;

      self.is_admin = false;

      self.chat = function (text, id, is_history) {

        var $admin = '';
        var $line = $('<li class="list-group-item" data-id="' + id + '"><strong>' + self.uuid + ':</strong> </li>');
        var $message = $('<span class="text" />').text(text).html();

        is_history = is_history || false;

        if (self.is_admin) {
          $line.addClass('admin');
        }

        $line.append($message);

        if (me.is_admin) {
          var $remove = $('<a href="#" class="remove">Remove</a>');
          $remove.click(function(){
            me.remove(id);
            return false;
          });
          $line.append($remove);
        }

        if (is_history) {
          $output.prepend($line);
        } else {
          $output.append($line);
        }

      };

      var init = function () {

        if ($.inArray(self.uuid, options.admins) > -1) {
          self.is_admin = true;
        }

      };

      init();

      return self;

    };

    Client = function () {

      var self = new User(options.username);

      Users.set(self.uuid);

      if(self.is_admin) {

        self.remove = function(message_id) {
          
          pubnub.publish({
            channel: channel,
            message: {
              type: 'remove',
              payload: {
                uuid: self.uuid,
                id: message_id
              }
            }
          });

        }
         
      }

      return self;

    };

    (function () {

      Users = new User_factory();
      me = new Client();

      var $tpl = $('<div class="panel-heading">' + options.title + '</div> \
        <ul class="list-group chat-output"> \
        </ul> \
        <div class="panel-body"> \
          <form class="chat"> \
            <div class="input-group"> \
              <input type="text" class="form-control chat-input" /> \
              <span class="input-group-btn"> \
                <button type="submit" class="btn btn-default">Send Message</button> \
              </span> \
            </div> \
          </form> \
        </div>');

      $container.append($tpl);

      $input = $container.find('.chat-input');
      $output = $container.find('.chat-output');

      var first_load = true;
      var full_history_loaded = false;

      var moderation = [];

      pubnub = PUBNUB.init({
        publish_key: options.publish_key,
        subscribe_key: options.subscribe_key,
        uuid: me.uuid
      });

      var handle_message = function(data, is_history) {

        // append chat messages
        if (data.type === 'chat') {

          Users.set(data.payload.uuid).chat(data.payload.text, data.payload.id, is_history);

          if (auto_scroll) {
            $output.scrollTop($output[0].scrollHeight);
          }
 
        }

        // add removals to array
        if(data.type == "remove") {
          moderation.push(data);
        }

        // moderate new list of messages based on new info
        for(i = 0; i < moderation.length; i++) {

          data = moderation[i];

          if(Users.set(data.payload.uuid).is_admin){
            $container.find('*[data-id="' + data.payload.id +'"]').remove();
          }

        }

      }

      pubnub.subscribe({
        channel: channel,
        message: function (data) {
          handle_message(data, false);
        }
      });

      history_obj = {
        channel: channel,
        count: 20,
        callback: function (history) {

          var $last_el = $output.children().first();
          var data = null;
          var i = 0;

          history[0].reverse();

          if (history[0].length) {

            history_obj.start = history[1];

            for (i = 0; i < history[0].length; i++) {

              if (history[0][i].hasOwnProperty('payload')) {

                data = history[0][i];
                handle_message(data, true); 

              }

            }

            if (first_load) {
              $output.scrollTop($output[0].scrollHeight);
            } else {
              $output.scrollTop($last_el.offset().top);
            }

            first_load = false;
            auto_scroll = false;

          } else {

            var $line = $('<li class="list-group-item loading-complete">End Of Chat Log</li>');
            $output.prepend($line);
            full_history_loaded = true;

          }

          $container.find('.loading-history').remove();

        }
      };

      pubnub.history(history_obj);

      $('.chat').submit(function () {

        if ($input.val().length) {

          auto_scroll = true;

          pubnub.uuid(function(message_id){
            
            pubnub.publish({
              channel: channel,
              message: {
                type: 'chat',
                payload: {
                  text: $input.val(),
                  uuid: me.uuid,
                  id: message_id
                }
              }
            });

          });

        }

        $input.val('');

        return false;

      });

      $output.scroll(function () {

        if ($output.scrollTop() === 0 && !full_history_loaded) {

          pubnub.history(history_obj);

          var $line = $('<li class="list-group-item loading-history">Loading...</li>');
          $output.prepend($line);

        }

        if ((($output.prop('scrollHeight') - 30) < ($output.scrollTop() + $output.height()))) {
          auto_scroll = true;
        } else {
          auto_scroll = false;
        }

      });

    }());

    return $container;

  };

}(jQuery));