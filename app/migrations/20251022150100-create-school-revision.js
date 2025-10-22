module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('school_revisions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      school_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'schools',
          key: 'id'
        }
      },
      urn: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ukprn: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      group_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      education_phase_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      website: {
        type: Sequelize.STRING
      },
      telephone: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_by_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_by_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE
      },
      deleted_by_id: {
        type: Sequelize.UUID
      },
      revision_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      revision_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      revision_by_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'The user who made the change'
      }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('school_revisions')
  }
}
