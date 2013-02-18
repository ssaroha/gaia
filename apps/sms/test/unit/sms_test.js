/*
  ThreadListUI Tests
*/
'use strict';
// Mockuping l10n
navigator.mozL10n = {
  get: function get(key) {
    return key;
  },
  DateTimeFormat: function() {
    this.localeFormat = function(date, format) {
      return date;
    };
  }
};

// Import of all code needed
requireApp('sms/js/contacts.js');
requireApp('sms/js/fixed_header.js');
requireApp('sms/js/searchUtils.js');
requireApp('sms/js/utils.js');
requireApp('sms/test/unit/contact_mockup.js');
requireApp('sms/test/unit/utils_mockup.js');
requireApp('sms/test/unit/messages_mockup.js');
requireApp('sms/test/unit/sms_test_html_mockup.js');
requireApp('sms/test/unit/thread_list_mockup.js');
requireApp('sms/js/sms.js');



suite('Threads-list Tests', function() {

  // Define some useful functions for the following tests

  function getElementsInContainerByTag(container, tagName) {
    return container.querySelectorAll(tagName);
  }

  function assertNumberOfElementsInContainerByTag(container, number, tagName) {
    var elements = getElementsInContainerByTag(container, tagName);
    assert.equal(elements.length, number);
    return elements;
  }

  function getElementsInContainerByClass(container, className) {
    return container.getElementsByClassName(className);
  }

  function assertNumberOfElementsInContainerByClass(container, number, className) {
    var elements = getElementsInContainerByClass(container, className);
    assert.equal(elements.length, number);
    return elements;
  }

  function createDOM() {
    // We clean previouos stuff at the beginning
    window.document.body.innerHTML = '';

    // Add main wrapper
    var mainWrapper = document.createElement('article');
    mainWrapper.id = 'main-wrapper';

    // ------- Add thread-list view ---------
    var threadList = document.createElement('section');
    threadList.id = 'thread-list';

    // Add elements inside thread-list view

    // Thread-list header
    var threadListHeader = document.createElement('header');
    threadListHeader.innerHTML = renderThreadListHeader();

    // Thread-list container
    var threadListContainer = document.createElement('article');
    threadListContainer.id = 'thread-list-container';

    // Thread-list fixed-header
    var fixedHeader = document.createElement('div');
    fixedHeader.id = 'threads-fixed-container';

    // Thread-list Edit form
    var threadListEditForm = document.createElement('form');
    threadListEditForm.id = 'threads-edit-form';
    threadListEditForm.setAttribute('role', 'dialog');
    threadListEditForm.dataset.type = 'edit';
    threadListEditForm.innerHTML =  renderThreadListEdit();
    // Append all elemnts to thread-list view
    threadList.appendChild(threadListHeader);
    threadList.appendChild(threadListContainer);
    threadList.appendChild(fixedHeader);
    threadList.appendChild(threadListEditForm);

    // Adding to DOM the Thread-list view
    mainWrapper.appendChild(threadList);

    // --------- Add thread-messages (bubbles) view ---------
    var threadMessages = document.createElement('section');
    threadMessages.id = 'thread-messages';

    // Thread-messages main header
    var threadMsgHeader = document.createElement('header');
    threadMsgHeader.innerHTML = renderThreadMsgHeader();

    // Thread-messages sub-header
    var threadMsgSubHeader = document.createElement('div');
    threadMsgSubHeader.id = 'contact-carrier';

    // Thread-messages container
    var threadMsgContainer = document.createElement('article');
    threadMsgContainer.id = 'messages-container';

    // Thread-messages edit form
    var threadMsgEditForm = document.createElement('form');
    threadMsgEditForm.id = 'messages-edit-form';
    threadMsgEditForm.innerHTML = renderThreadMsgEdit();

    // Thread-messages input form
    var threadMsgInputForm = document.createElement('form');
    threadMsgInputForm.id = 'new-sms-form';
    threadMsgInputForm.innerHTML = renderThreadMsgInputBar();

    threadMessages.appendChild(threadMsgHeader);
    threadMessages.appendChild(threadMsgSubHeader);
    threadMessages.appendChild(threadMsgContainer);
    threadMessages.appendChild(threadMsgEditForm);
    threadMessages.appendChild(threadMsgInputForm);

    // Adding to DOM the Thread-messages view
    mainWrapper.appendChild(threadMessages);

    // --------- Loading screen ---------
    var loadingScreen = document.createElement('article');
    loadingScreen.id = 'loading';

    // At the end we add all elements to document
    window.document.body.appendChild(mainWrapper);
    window.document.body.appendChild(loadingScreen);
  }

  // Previous setup
  suiteSetup(function() {
    // We mockup the method for retrieving the threads
    MessageManager.getThreads = function(callback, extraArg) {
      var threadsMockup = new MockThreadList();
      callback(threadsMockup, extraArg);
    };

    MessageManager.getMessages = function(options) {

      var stepCB = options.stepCB, // CB which manage every message
        filter = options.filter, // mozMessageFilter
        invert = options.invert, // invert selection
        endCB = options.endCB,   // CB when all messages retrieved
        endCBArgs = options.endCBArgs; //Args for endCB

      var messagesMockup = new MockThreadMessages();
      for (var i = 0, l = messagesMockup.length; i < l; i++) {
        stepCB(messagesMockup[i]);
      }
    };

    // Create DOM structure
    createDOM();

    // We mockup the method for retrieving the info
    // of a contact given a number
    ContactDataManager.getContactData = function(number, callback) {
      // Get the contact
      if (number === '1977') {
        callback(new MockContact());
      }
    };

    // We render all elements
    MessageManager.init();
    ThreadUI.view.innerHTML = '';
    ThreadUI.renderMessages();
  });

  // Let's go with tests!
/*
// These tests are currently failing and have been temporarily disabled as per
// Bug 838993. They should be fixed and re-enabled as soon as possible as per
// Bug 840497.
  suite('Threads-list rendering', function() {

    test('Check HTML structure', function() {
      // Check the HTML structure, and if it fits with Building Blocks

      // Given our mockup, we should have 4 grous UL/HEADER
      assertNumberOfElementsInContainerByTag(ThreadListUI.view, 3, 'ul');
      assertNumberOfElementsInContainerByTag(ThreadListUI.view, 3, 'header');

      // We know as well that we have, in total, 5 threads
      assertNumberOfElementsInContainerByTag(ThreadListUI.view, 4, 'li');
      assertNumberOfElementsInContainerByTag(ThreadListUI.view, 4, 'a');

      // In our mockup we shoul group the threads following day criteria
      // In the second group, we should have 2 threads
      var date = getMockupedDate(2);
      var threadsContainer = document.getElementById('threadsContainer_' + Utils.getDayDate(date.getTime()));
      assertNumberOfElementsInContainerByTag(threadsContainer, 2, 'li');
    });

    test('Render unread style properly', function() {
      // We know that only one thread is unread
      assertNumberOfElementsInContainerByClass(ThreadListUI.view, 1, 'unread');
    });

    test('Update thread with contact info', function() {
      // Given a number, we should retrieve the contact and update the info
      var threadWithContact = document.getElementById('thread_1977');
      var contactName = threadWithContact.getElementsByClassName('name')[0].innerHTML;
      assert.equal(contactName, 'Josh');
    });

  });
*/

  suite('Threads-list edit mode', function() {

/*
// These tests are currently failing and has been temporarily disabled as per
// Bug 838993. They should be fixed and re-enabled as soon as possible as per
// Bug 840497.
    test('Check edit mode form', function() {
      // Do we have all inputs ready?
      assertNumberOfElementsInContainerByTag(ThreadListUI.view, 4, 'input');
    });

    test('Select all/Deselect All buttons', function() {
      // Retrieve all inputs
      var inputs = ThreadListUI.view.getElementsByTagName('input');
      // Activate all inputs
      for (var i = inputs.length - 1; i >= 0; i--) {
        inputs[i].checked = true;
        ThreadListUI.clickInput(inputs[i]);
      }
      ThreadListUI.checkInputs();
      assert.isTrue(document.getElementById('select-all-threads').classList.contains('disabled'));
      assert.isFalse(document.getElementById('deselect-all-threads').classList.contains('disabled'));
      // Deactivate all inputs
      for (var i = inputs.length - 1; i >= 0; i--) {
        inputs[i].checked = false;
        ThreadListUI.clickInput(inputs[i]);
      }
      ThreadListUI.checkInputs();
      assert.isFalse(document.getElementById('select-all-threads').classList.contains('disabled'));
      assert.isTrue(document.getElementById('deselect-all-threads').classList.contains('disabled'));
      // Activate only one
      inputs[0].checked = true;
      ThreadListUI.clickInput(inputs[0]);
      ThreadListUI.checkInputs();
      assert.isFalse(document.getElementById('select-all-threads').classList.contains('disabled'));
      assert.isFalse(document.getElementById('deselect-all-threads').classList.contains('disabled'));
    });
  });
*/


  suite('Thread-messages Edit mode (bubbles view)', function() {
    test('Check edit mode form', function() {
      // ThreadUI.view.innerHTML = '';
      assertNumberOfElementsInContainerByTag(ThreadUI.view, 5, 'input');
    });

    test('Select/Deselect all', function() {
      var inputs = ThreadUI.view.getElementsByTagName('input');
      // Activate all inputs
      for (var i = inputs.length - 1; i >= 0; i--) {
        inputs[i].checked = true;
        ThreadUI.chooseMessage(inputs[i]);
      }
      ThreadUI.checkInputs();
      assert.isTrue(document.getElementById('select-all-messages').classList.contains('disabled'));
      assert.isFalse(document.getElementById('deselect-all-messages').classList.contains('disabled'));
      // Deactivate all inputs
      for (var i = inputs.length - 1; i >= 0; i--) {
        inputs[i].checked = false;
        ThreadUI.chooseMessage(inputs[i]);
      }
      ThreadUI.checkInputs();
      assert.isFalse(document.getElementById('select-all-messages').classList.contains('disabled'));
      assert.isTrue(document.getElementById('deselect-all-messages').classList.contains('disabled'));
      // Activate only one
      inputs[0].checked = true;
      ThreadUI.chooseMessage(inputs[0]);
      ThreadUI.checkInputs();
      assert.isFalse(document.getElementById('select-all-messages').classList.contains('disabled'));
      assert.isFalse(document.getElementById('deselect-all-messages').classList.contains('disabled'));
    });
  });

  suite('Thread-messages rendering (bubbles view)', function() {
    test('Check HTML structure', function() {
      // It should have 3 bubbles
      assertNumberOfElementsInContainerByTag(ThreadUI.view, 5, 'li');
      // Grouped in 2 sets
      assertNumberOfElementsInContainerByTag(ThreadUI.view, 3, 'header');
      assertNumberOfElementsInContainerByTag(ThreadUI.view, 3, 'ul');
    });

    test('Check message status & styles', function() {
      assertNumberOfElementsInContainerByClass(ThreadUI.view, 1, 'sending');
      assertNumberOfElementsInContainerByClass(ThreadUI.view, 1, 'sent');
      assertNumberOfElementsInContainerByClass(ThreadUI.view, 1, 'received');
      assertNumberOfElementsInContainerByClass(ThreadUI.view, 2, 'error');
    });

    test('Check input form & send button', function() {
      ThreadUI.enableSend();
      // At the begginning it should be disabled
      assert.isTrue(ThreadUI.sendButton.disabled);
      // If we type some text in a thread
      ThreadUI.input.value = 'Hola';
      ThreadUI.enableSend();
      assert.isFalse(ThreadUI.sendButton.disabled);
      // We change to 'new'
      window.location.hash = '#new';
      ThreadUI.enableSend();
      // In '#new' I need the contact as well, so it should be disabled
      assert.isTrue(ThreadUI.sendButton.disabled);
      // Adding a contact should enable the button
      ThreadUI.contactInput.value = '123123123';
      ThreadUI.enableSend();
      assert.isFalse(ThreadUI.sendButton.disabled);
      // Finally we clean the form
      ThreadUI.cleanFields();
      assert.isTrue(ThreadUI.sendButton.disabled);
    });
  });

  suite('Phone Links in SMS', function() {
    var Message = {
        id: '123',
        body: 'Hello there'
    };

    //test
    test('#numberWithDash', function() {
        var messageBody = 'Hello there, here are numbers with ' +
                      'dashes 408-746-9721, 4087469721, 7469721';
      var id = '12345';
      Message.id = id;
      Message.body = messageBody;
      var messageDOM = ThreadUI.buildMessageDOM(Message, false);
      var anchors = messageDOM.querySelectorAll('a.phone-link');
      assert.equal(anchors.length, 3,
        '3 Contact handlers are attached for 3 phone numbers in DOM');
      assert.equal(anchors[0].getAttribute('val'),
        '408-746-9721', 'First number is 408-746-9721');
      assert.equal(anchors[1].getAttribute('val'),
        '4087469721', 'Second number is 4087469721');
      assert.equal(anchors[2].getAttribute('val'),
        '7469721', 'Third number is 7469721');
    });

    test('#complexTest with 7 digit numbers, ip, decimals', function() {
      var messageBody = '995-382-7369 futures to a 4458901 slight' +
          ' 789-7890 rebound +1-556-667-7789 on Wall Street 9953827369' +
          ' on Wednesday, +12343454567 with 55.55.55 futures +919810137553' +
          ' for the S&P 500 up 0.34 percent, Dow Jones futures up 0.12' +
          ' percent100 futures up 0.51 percent at 0921 GMT.';
      var id = '12346';
      Message.id = id;
      Message.body = messageBody;
      var messageDOM = ThreadUI.buildMessageDOM(Message, false);
      var anchors = messageDOM.querySelectorAll('a.phone-link');
      assert.equal(anchors.length, 7,
        '7 Contact handlers are attached for 7 phone numbers in DOM');
      assert.equal(anchors[0].getAttribute('val'),
        '995-382-7369', 'First number is 995-382-7369');
      assert.equal(anchors[1].getAttribute('val'),
        '4458901', 'Second number is 4458901');
      assert.equal(anchors[2].getAttribute('val'),
        '789-7890', 'Third number is 789-7890');
      assert.equal(anchors[3].getAttribute('val'),
        '+1-556-667-7789', 'Fourth number is +1-556-667-7789');
      assert.equal(anchors[4].getAttribute('val'),
        '9953827369', 'Fourth number is 9953827369');
      assert.equal(anchors[5].getAttribute('val'),
        '+12343454567', 'Fifth number is +12343454567');
      assert.equal(anchors[6].getAttribute('val'),
        '+919810137553', 'Sixth number is +919810137553');
    });
  });

});
