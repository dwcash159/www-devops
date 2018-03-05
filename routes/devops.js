var express = require('express');
var router = express.Router();

var exec = require('child_process').exec;

/* GET beam */
router.get('/*', function(req, res, next) {

  var url = require('url');
  var url_parts = url.parse(req.originalUrl, true);
  var query = url_parts.query;
  var pathname = url_parts.pathname.replace('/', '').split("/"); //.replace(/\//g,'')

  var commands =
    [
      { name : 'system.nginx_clear_cache_item', requireParameters: true, stacks: ['stack1'] },
      { name : 'system.nginx_clear_cache',      requireParameters: false, stacks: ['stack1'] },
      { name : 'system.restart_web',            requireParameters: false, stacks: ['stack1, stack3'] }
    ];

  //Validate Token
  var token = false;
  if (typeof query.token !== 'undefined' && query.token === 'xO9mXuVDVyCKFN45rJj3sgvVuA6yLOTi') {
    token = true;
  }

  var validCommand = false;
  var command;

  var validStack = false;
  var stack;
  var requireParameters = false;
  //Validate Command
  if (typeof pathname[1] !== 'undefined') {
    command = pathname[1];

    if (typeof pathname[2] !== 'undefined') {
      stack = pathname[2];
    }

    if (stack) {
      for (var i=0 ; i < commands.length ; i++)
      {
        if (commands[i].name === pathname[1]) {
          validCommand = true;
          requireParameters = commands[i].requireParameters;
          if ( commands[i].stacks.indexOf(stack) !== -1) {
            validStack = true;
          }
        }
      }
    }

  } else {
    //No command - display list
    validCommand = true;
  }

  if (command === 'list') {
    res.render('devops',
      { commands: commands
      }
    );
    return;
  }


  var parameters = false;
  if (typeof query.parameters !== 'undefined') {
    parameters = query.parameters;
    var buff = new Buffer(parameters, 'base64');
    parameters = buff.toString('ascii');
  }

  var validParameters = false;
  if (!requireParameters || requireParameters && typeof parameters === 'string') {
    validParameters = true;
  }

  console.log('Token: ', token);
  console.log('Stack:', stack);
  console.log('Parameters: ', parameters);
  console.log('Command: ', command);

  console.log('Valid Stack: ', validStack);
  console.log('Valid Command: ', validCommand);
  console.log('Valid Parameters: ', validParameters);
  console.log('Require Parameters: ', requireParameters);

  //If access denied present denied page.
  if ( !token) {
    res.status(500).render('denied', { });
    return;
  }

  if (!validCommand || !validStack || !validParameters) {
    res.json({success: false});
    return;
  }

  //get parameters if necessary
  if (validCommand && validStack) {

    var cmd;
    if (requireParameters && validParameters) {
      cmd = "devops -H " + stack + " " + command + ":" + parameters;
      console.log('Valid Parameters: true');
    }
    else {
      cmd = "devops -H " + stack + " " + command;
      console.log('Valid Parameters: false');
    }

    console.log('Execute Devops Command:', cmd);
    exec(cmd, function(error, stdout, stderr) {
      // command output is in stdout
      console.log('stdout: ', stdout);
      console.log('stderr: ', stderr);
    });


    res.json({success: true});
    return;
  }

  res.render('devops',
    {
      commands: commands
    }
  );

});

module.exports = router;