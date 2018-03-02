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
      { name : 'kcm.nginx_clear_cache_item', parameters: false, stacks: ['stack1'] },
      { name : 'kcm.nginx_clear_cache',      parameters: false, stacks: ['stack1'] },
      { name : 'system.restart_web',         parameters: false, stacks: ['stack1, stack3'] }
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

  var parameters;
  if (typeof query.parameters !== 'undefined') {
    parameters = query.parameters;
  }

  console.log(query.parameters);
  console.log(command);
  console.log(stack);
  console.log(validCommand);
  console.log(validStack);

  //If access denied present denied page.
  if ( !token || !validCommand || !validStack) {
    res.status(500).render('denied', { });
    return;
  }


  //get parameters if necessary
  if (validCommand && validStack) {

    var cmd = 'ls -lhs';

    exec(cmd, function(error, stdout, stderr) {
      // command output is in stdout
      console.log('stdout: ', stdout);
      console.log('stderr: ', stderr);
    });


    res.json({success: true});
    return;
  }

  res.render('devops',
    { commands: commands
    }
  );


  // // load the library
  // var SMB2 = require('smb2');
  //
  // // create an SMB2 instance
  // var smb2Client = new SMB2({
  //   share:'\\\\kcmfp1.kcmhq.org\\data',
  //   domain:'kcmhq',
  //   username:'999webapp2',
  //   password:'Ri33iTfL/z'
  // });
  //
  // var iframe = false;
  // if (typeof query.iframe !== 'undefined') {
  //   iframe = true;
  // }
  //
  // if (typeof query.download !== 'undefined') {
  //
  //   var downloadFile = function (data) {
  //     //specify Content will be an attachment
  //     res.setHeader('Content-disposition', 'attachment; filename='+query.download);
  //     res.setHeader('Content-type', 'application/octet-stream');
  //     res.end(data);
  //   };
  //
  //   smb2Client.readFile('public\\'+ pathname +'\\'+query.download, function(err,data) {console.log(err,data); downloadFile(data)})
  // } else {
  //
  //   var renderPage = function (err,files) {
  //
  //     if(err) throw err;
  //
  //     res.render('beam', {type:pathname, files:files, iframe: iframe })
  //
  //   };
  //
  //   smb2Client.readdir('public\\' + pathname, function(err, files){ renderPage(err,files)});
  // }

});

module.exports = router;