const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class SchoolRevision extends Model {
    static associate(models) {
      SchoolRevision.belongsTo(models.School, {
        foreignKey: 'schoolId',
        as: 'school'
      })

      SchoolRevision.belongsTo(models.User, {
        foreignKey: 'revisionById',
        as: 'revisionByUser'
      })
    }
  }

  SchoolRevision.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      schoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'school_id'
      },
      urn: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      ukprn: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      typeCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'type_code',
        validate: {
          notEmpty: true
        }
      },
      groupCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'group_code',
        validate: {
          notEmpty: true
        }
      },
      statusCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'status_code',
        validate: {
          notEmpty: true
        }
      },
      educationPhaseCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'education_phase_code',
        validate: {
          notEmpty: true
        }
      },
      website: {
        type: DataTypes.STRING
      },
      telephone: {
        type: DataTypes.STRING
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      createdById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by_id'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      },
      updatedById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'updated_by_id'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      },
      deletedById: {
        type: DataTypes.UUID,
        field: 'deleted_by_id'
      },
      revisionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'revision_number'
      },
      revisionAt: {
        type: DataTypes.DATE,
        field: 'revision_at'
      },
      revisionById: {
        type: DataTypes.UUID,
        field: 'revision_by_id'
      }
    },
    {
      sequelize,
      modelName: 'SchoolRevision',
      tableName: 'school_revisions',
      timestamps: false
    }
  )

  const activityHook = require('../hooks/activityHook')

  SchoolRevision.addHook('afterCreate', (instance, options) =>
    activityHook({
      entityType: 'school',
      revisionTable: 'school_revisions',
      entityIdField: 'schoolId'
    })(instance, {
      ...options,
      hookName: 'afterCreate'
    })
  )

  return SchoolRevision
}
