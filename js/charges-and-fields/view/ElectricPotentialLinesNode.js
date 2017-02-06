// Copyright 2015, University of Colorado Boulder

/**
 * Scenery Node responsible for the drawing of the electricPotential lines and their accompanying voltage labels
 * A debug option can enabled the view of the (model) position points used to calculate the electric potential line.
 * The (pruned) position points that are used to draw the electric potential line can also be displayed.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var TandemText = require( 'TANDEM/scenery/nodes/TandemText' );
  var Util = require( 'DOT/Util' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // phet-io modules
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  // strings
  var pattern0Value1UnitsString = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  // constants
  var IS_DEBUG = false; // if set to true will show the (model and view) positions use in the calculation of the electric potential lines

  /**
   * Function that generates a voltage label for the electricPotential line
   * @param {ElectricPotentialLine} electricPotentialLine
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   * @constructor
   */
  function VoltageLabel( electricPotentialLine, modelViewTransform, tandem ) {

    // TODO: The instrumented items in voltageLabel are created must be given unique phetioID values.
    // Leaving disabled for now.

    Node.call( this, { cursor: 'pointer' } );

    var electricPotential = electricPotentialLine.electricPotential;
    var position = electricPotentialLine.position;

    var self = this;
    var locationProperty = new Property( position, {
      tandem: tandem.createTandem( 'locationProperty', { enabled: false } ),
      phetioValueType: TVector2
    } );

    this.addInputListener( new MovableDragHandler( locationProperty, {
      tandem: tandem.createTandem( 'inputListener', { enabled: false } ),
      modelViewTransform: modelViewTransform,
      startDrag: function( event ) {
        // Move the label to the front of this layer when grabbed by the user.
        self.moveToFront();
      }
    } ) );


    // a smaller electric potential should have more precision
    var electricPotentialValueString = ( Math.abs( electricPotential ) < 1 ) ?
                                       Util.toFixed( electricPotential, 2 ) :
                                       Util.toFixed( electricPotential, 1 );

    // Create the voltage label for the electricPotential line
    var voltageLabelString = StringUtils.format( pattern0Value1UnitsString, electricPotentialValueString, voltageUnitString );
    var voltageLabelText = new TandemText( voltageLabelString, {
      font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT,
      center: modelViewTransform.modelToViewPosition( position ),
      fill: ChargesAndFieldsColorProfile.electricPotentialLineProperty,
      tandem: tandem.createTandem( 'voltageLabelText', { enabled: false } )
    } );

    // Create a background rectangle for the voltage label
    var backgroundRectangle = new Rectangle( 0, 0, voltageLabelText.width * 1.2, voltageLabelText.height * 1.2, 3, 3, {
      center: modelViewTransform.modelToViewPosition( position ),
      fill: ChargesAndFieldsColorProfile.voltageLabelBackgroundProperty,
      tandem: tandem.createTandem( 'backgroundRectangle', { enabled: false } )
    } );

    this.addChild( backgroundRectangle ); // must go first
    this.addChild( voltageLabelText );

    // finds the closest location on positionArray to the position of the cursor
    var locationFunction = function( cursorLocation ) {
      var smallestDistanceSquared = Number.POSITIVE_INFINITY;
      var closestLocation; // {Vector2}
      electricPotentialLine.positionArray.forEach( function( position ) {
        var distanceSquared = position.distanceSquared( cursorLocation );
        if ( distanceSquared < smallestDistanceSquared ) {
          smallestDistanceSquared = distanceSquared;
          closestLocation = position;
        }
      } );
      self.center = modelViewTransform.modelToViewPosition( closestLocation );
    };

    locationProperty.link( locationFunction );

    // create a dispose function to unlink the color functions
    this.disposeVoltageLabel = function() {
      locationProperty.unlink( locationFunction );
    };


  }

  inherit( Node, VoltageLabel, {
    dispose: function() {
      this.disposeVoltageLabel();
    }
  } );

  /**
   * Function that generates a scenery path from the shape of the electricPotential line
   * @param {Shape} electricPotentialLineShape
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ElectricPotentialLinePath( electricPotentialLineShape, modelViewTransform ) {
    Path.call( this, modelViewTransform.modelToViewShape( electricPotentialLineShape ), {
      stroke: ChargesAndFieldsColorProfile.electricPotentialLineProperty
    } );
  }

  inherit( Path, ElectricPotentialLinePath );

  /**
   * Function that generates an array of Circles with their centers determined by the position array
   * @param {Array.<Vector2>} positionArray
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function Circles( positionArray, modelViewTransform, options ) {

    var self = this;

    Node.call( this );

    options = _.extend( {
      radius: 2
    }, options );

    // create and add all the circles
    positionArray.forEach( function( position ) {
      var circle = new Circle( options.radius, options );
      circle.center = modelViewTransform.modelToViewPosition( position );
      self.addChild( circle );
    } );
  }

  inherit( Node, Circles );

  /**
   * Scenery node that is responsible for displaying the electric potential lines
   *
   * @param {ObservableArray.<ElectricPotentialLine>} electricPotentialLines - array of models of electricPotentialLine
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} areValuesVisibleProperty - control the visibility of the voltage labels
   * @param {Tandem} tandem
   * @constructor
   */
  function ElectricPotentialLinesNode( electricPotentialLines, modelViewTransform, areValuesVisibleProperty, tandem ) {

    var self = this;

    // call the super constructor
    Node.call( this );

    // Create and add the parent node for all the lines (paths)
    var pathsNode = new Node();
    this.addChild( pathsNode );

    // Create and add the parent node for the circles (used in DEBUG mode)
    if ( IS_DEBUG ) {
      var circlesNode = new Node();
      this.addChild( circlesNode );
    }

    // Create and add the parent node for the label nodes
    var labelsNode = new Node();
    this.addChild( labelsNode );

    // Monitor the electricPotentialLineArray and create a path and label for each electricPotentialLine
    electricPotentialLines.addItemAddedListener( function( electricPotentialLine ) {

      var electricPotentialLinePath = new ElectricPotentialLinePath( electricPotentialLine.getShape(), modelViewTransform );
      pathsNode.addChild( electricPotentialLinePath );

      var voltageLabel = new VoltageLabel( electricPotentialLine, modelViewTransform, tandem.createTandem( 'voltageLabel' ) );
      labelsNode.addChild( voltageLabel );

      if ( IS_DEBUG ) {

        // create all the circles corresponding to the positions calculated in the model
        var electricPotentialModelCircles = new Circles( electricPotentialLine.positionArray, modelViewTransform, {
          fill: 'pink',
          radius: 1
        } );

        // create all the circles corresponding to the positions used to create the shape of the electric potential line
        var electricPotentialViewCircles = new Circles( electricPotentialLine.getPrunedPositionArray( electricPotentialLine.positionArray ), modelViewTransform, { fill: 'orange' } );

        // no translatable strings, for debug only
        var text = new TandemText( 'model=' + electricPotentialLine.positionArray.length +
                                   '    view=' + electricPotentialLine.getPrunedPositionArray( electricPotentialLine.positionArray ).length, {
          center: modelViewTransform.modelToViewPosition( electricPotentialLine.position ),
          fill: 'green',
          font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT,
          tandem: tandem.createTandem( 'debugText', { enabled: false } )
        } );

        // add the circles and text
        circlesNode.addChild( electricPotentialModelCircles );
        circlesNode.addChild( electricPotentialViewCircles );
        circlesNode.addChild( text );
      }

      electricPotentialLines.addItemRemovedListener( function removalListener( removedElectricPotentialLine ) {
        if ( removedElectricPotentialLine === electricPotentialLine ) {

          pathsNode.removeChild( electricPotentialLinePath );
          labelsNode.removeChild( voltageLabel );
          if ( IS_DEBUG ) {
            circlesNode.removeAllChildren();
          }

          // dispose of the link for garbage collection
          electricPotentialLinePath.dispose();
          self.disposeElectricPotentialLinesNode();
          voltageLabel.dispose();

          electricPotentialLines.removeItemRemovedListener( removalListener );
        }
      } ); // end of addItemRemovedListener

    } ); // end of addItemAddedListener

    this.disposeElectricPotentialLinesNode = function() {
      areValuesVisibleProperty.unlinkAttribute( labelsNode, 'visible' );
    };

    // Control the visibility of the value (voltage) labels
    // no need to unlink present for the lifetime of the sim
    areValuesVisibleProperty.linkAttribute( labelsNode, 'visible' );
  }

  chargesAndFields.register( 'ElectricPotentialLinesNode', ElectricPotentialLinesNode );

  return inherit( Node, ElectricPotentialLinesNode, {
    dispose: function() {
      this.disposeElectricPotentialLinesNode();
    }
  } );
} );

