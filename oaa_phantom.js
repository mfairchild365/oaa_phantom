var page = require('webpage').create(),
	system = require('system'),
	address, cwd;

if (system.args.length < 2 || system.args.length > 3) {
	console.log('Usage: phantomjs oaa_phantom.js URL [rule_set=ARIA_STRICT]');
	phantom.exit();
}

address = system.args[1];

//Variables:
var rule_set = 'ARIS_STRICT';
if(system.args.length == 3) {
	rule_set = system.args[2];
}

// Get the absolute working directory from the PWD var and
// and the command line $0 argument.
var cwd = system.env['PWD'];
if (system.args[0].substr(0, 1) === '/') {
	cwd = system.args[0];
} else {
	cwd += '/' + system.args[0];
}

cwd = cwd.substr(0, cwd.lastIndexOf('/'));

//Open the page and run the code.
page.open(address, function (status) {
	if (status !== 'success') {
		console.log('Unable to load the address!');
		phantom.exit();
	}
	
	//Inject 
	page.injectJs(cwd + '/oaa/oaa_a11y_evaluation.js');
	page.injectJs(cwd + '/oaa/oaa_a11y_rules.js');
	page.injectJs(cwd + '/oaa/oaa_a11y_rulesets.js');

	var result = page.evaluate(function(rule_set){
		// A tools developer wants to use the ARIAStrictRuleset
		var asRuleset = OpenAjax.a11y.RulesetManager.getRuleset(rule_set);

		// then needs to get an evaluatorFactory
		var evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();

		// and configure it...
		evaluatorFactory.setParameter('ruleset', asRuleset);

		evaluatorFactory.setFeature('eventProcessing',   'none');
		evaluatorFactory.setFeature('brokenLinkTesting', false);

		// before getting the actual evaluator
		var evaluator = evaluatorFactory.newEvaluator();

		// and doing the evaluation
		var doc   = window.document;
		var title = doc.title;
		var url   = window.location.href;

		// perform an evaluation
		var evaluation_result = evaluator.evaluate(doc, title, url);
		
		return evaluation_result.toJSON();
	}, rule_set);
	
	console.log(result);
	phantom.exit();
});

